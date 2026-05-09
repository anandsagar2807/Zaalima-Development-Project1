import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { generateToken, generateStateToken, verifyStateToken } from '../utils/jwt';
import { findUserByEmail, findUserByGithubId, createUser, updateUserGitHub, createLog } from '../services/user.service';
import { logger } from '../utils/logger';
import { env } from '../config/env';

const router = Router();

const GITHUB_CLIENT_ID = env.githubClientId;
const GITHUB_CLIENT_SECRET = env.githubClientSecret;
const GITHUB_CALLBACK_URL = env.githubCallbackUrl;
const FRONTEND_URL = env.frontendUrl;

// GitHub OAuth scopes
const GITHUB_SCOPES = ['read:user', 'user:email', 'repo', 'read:org'];

/**
 * GET /auth/github
 * Redirects to the Next.js OAuth flow so the redirect_uri matches
 * the GitHub OAuth App's registered callback URL.
 */
router.get('/github', (req: Request, res: Response) => {
  try {
    // Redirect to the Next.js connect-github route which handles the full OAuth flow
    // The GitHub OAuth App callback is registered as http://localhost:3000/api/connect-github/callback
    res.redirect(`${FRONTEND_URL}/api/connect-github`);
  } catch (error) {
    logger.error('GitHub OAuth initiation failed', { error });
    res.status(500).json({ error: 'Failed to initiate GitHub authorization' });
  }
});

/**
 * GET /auth/github/callback
 * Handles GitHub OAuth callback
 */
router.get('/github/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    const storedState = req.cookies?.github_oauth_state;

    // Validate state parameter (CSRF protection)
    if (!state || !storedState || state !== storedState || !verifyStateToken(state as string)) {
      logger.warn('Invalid OAuth state parameter');
      return res.redirect(`${FRONTEND_URL}/dashboard/integrations?error=invalid_state`);
    }

    // Clear state cookie
    res.clearCookie('github_oauth_state');

    if (!code) {
      logger.warn('No authorization code received');
      return res.redirect(`${FRONTEND_URL}/dashboard/integrations?error=no_code`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_CALLBACK_URL,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error || !tokenData.access_token) {
      logger.error('Failed to exchange code for token', { error: tokenData.error });
      return res.redirect(`${FRONTEND_URL}/dashboard/integrations?error=token_exchange_failed`);
    }

    const accessToken = tokenData.access_token;

    // Fetch GitHub user profile
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const githubUser = await userResponse.json();

    if (!githubUser.id) {
      logger.error('Failed to fetch GitHub user profile');
      return res.redirect(`${FRONTEND_URL}/dashboard/integrations?error=profile_fetch_failed`);
    }

    // Fetch user email if not public
    let email = githubUser.email;
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      const emails = await emailResponse.json();
      const primaryEmail = emails.find((e: any) => e.primary);
      email = primaryEmail?.email || emails[0]?.email;
    }

    if (!email) {
      logger.error('No email found for GitHub user');
      return res.redirect(`${FRONTEND_URL}/dashboard/integrations?error=no_email`);
    }

    // Check if user already exists by email
    let user = await findUserByEmail(email);

    if (user) {
      // Check if GitHub account is already linked to another user
      if (user.github_id && user.github_id !== String(githubUser.id)) {
        logger.warn('GitHub account already linked to different user');
        return res.redirect(`${FRONTEND_URL}/dashboard/integrations?error=account_already_linked`);
      }

      // Update existing user with GitHub data
      user = await updateUserGitHub(user.id, {
        githubId: String(githubUser.id),
        githubUsername: githubUser.login,
        githubAvatar: githubUser.avatar_url,
        githubAccessToken: accessToken,
        githubConnected: true,
        githubProfileUrl: githubUser.html_url,
        githubPublicRepos: githubUser.public_repos || 0,
        githubFollowers: githubUser.followers || 0,
        githubFollowing: githubUser.following || 0,
        name: user.name || githubUser.name,
        avatar: user.avatar_url || githubUser.avatar_url,
      });
    } else {
      // Check if a user with this GitHub ID already exists
      const existingGithubUser = await findUserByGithubId(String(githubUser.id));
      if (existingGithubUser) {
        // Update the existing GitHub user with the email
        user = await updateUserGitHub(existingGithubUser.id, {
          githubAccessToken: accessToken,
          githubConnected: true,
          githubUsername: githubUser.login,
          githubAvatar: githubUser.avatar_url,
          githubProfileUrl: githubUser.html_url,
          githubPublicRepos: githubUser.public_repos || 0,
          githubFollowers: githubUser.followers || 0,
          githubFollowing: githubUser.following || 0,
          name: githubUser.name,
          avatar: githubUser.avatar_url,
        });
      }

      if (!user) {
        // Create new user
        user = await createUser({
          email,
          name: githubUser.name,
          avatar: githubUser.avatar_url,
          githubId: String(githubUser.id),
          githubUsername: githubUser.login,
          githubAvatar: githubUser.avatar_url,
          githubAccessToken: accessToken,
          githubConnected: true,
          githubProfileUrl: githubUser.html_url,
          githubPublicRepos: githubUser.public_repos || 0,
          githubFollowers: githubUser.followers || 0,
          githubFollowing: githubUser.following || 0,
        });
      }
    }

    if (!user) {
      logger.error('Failed to create or update user');
      return res.redirect(`${FRONTEND_URL}/dashboard/integrations?error=user_creation_failed`);
    }

    // Log the connection
    await createLog({
      userId: user.id,
      level: 'info',
      event: 'github_connect',
      message: 'GitHub account connected successfully',
      metadata: {
        githubUsername: githubUser.login,
        githubId: githubUser.id,
      },
    });

    // Generate JWT token
    const jwtToken = generateToken({
      userId: String(user.id),
      email: user.email || email,
    });

    // Set JWT in httpOnly cookie
    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    logger.info('GitHub OAuth completed successfully', {
      userId: user.id,
      githubUsername: githubUser.login,
    });

    // Redirect to dashboard with success
    res.redirect(`${FRONTEND_URL}/dashboard/integrations?success=true`);
  } catch (error) {
    logger.error('GitHub OAuth callback error', { error });
    res.redirect(`${FRONTEND_URL}/dashboard/integrations?error=callback_failed`);
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar_url,
        githubConnected: user.github_connected,
        githubUsername: user.github_login,
        githubAvatar: user.github_avatar,
        githubProfileUrl: user.github_profile_url,
        githubPublicRepos: user.github_public_repos,
        githubFollowers: user.github_followers,
        githubFollowing: user.github_following,
        githubConnectedAt: user.github_connected_at,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch user', { error });
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

/**
 * POST /auth/logout
 * Logout user — clears all auth cookies comprehensively.
 * Does NOT require authMiddleware so that a client with an expired/missing
 * token can still trigger a full cookie cleanup.
 */
router.post('/logout', async (req: AuthRequest, res: Response) => {
  try {
    // 1. Clear JWT token cookie (primary auth cookie)
    res.clearCookie('token', { path: '/' });

    // 2. Clear GitHub OAuth state cookie
    res.clearCookie('github_oauth_state', { path: '/' });

    // 3. Clear all GitGuard custom cookies
    res.clearCookie('gitguard_github_connected', { path: '/' });
    res.clearCookie('gitguard_github_login', { path: '/' });
    res.clearCookie('gitguard_github_oauth_state', { path: '/' });

    // 4. Clear Clerk cookies (in case they're accessible on this domain)
    res.clearCookie('__session', { path: '/' });
    res.clearCookie('__client_uat', { path: '/' });

    // 5. Log the logout if we have a user ID
    if (req.userId) {
      await createLog({
        userId: Number(req.userId),
        level: 'info',
        event: 'auth',
        message: 'User logged out',
      }).catch(() => {
        // Log creation failure is non-fatal
      });
    }

    // 6. Add cache-control headers to prevent caching of this response
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout failed', { error });

    // Even on error, attempt to clear cookies
    res.clearCookie('token', { path: '/' });
    res.clearCookie('github_oauth_state', { path: '/' });
    res.clearCookie('gitguard_github_connected', { path: '/' });
    res.clearCookie('gitguard_github_login', { path: '/' });
    res.clearCookie('gitguard_github_oauth_state', { path: '/' });

    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;
