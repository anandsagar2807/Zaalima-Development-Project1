import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { findUserById, updateUserGitHub, disconnectUserGitHub, decryptUserToken, createLog } from '../services/user.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/github/profile
 * Get GitHub profile for authenticated user
 */
router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await findUserById(Number(req.userId));

    if (!user || !user.github_connected || !user.github_access_token) {
      return res.status(400).json({ error: 'GitHub account not connected' });
    }

    const accessToken = decryptUserToken(user.github_access_token);

    // Fetch fresh GitHub profile data
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or revoked
        await disconnectUserGitHub(String(user._id));
        return res.status(401).json({ error: 'GitHub token expired. Please reconnect.' });
      }
      throw new Error('Failed to fetch GitHub profile');
    }

    const githubProfile = await response.json();

    // Update user data with fresh info
    await updateUserGitHub(String(user._id), {
      githubPublicRepos: githubProfile.public_repos || 0,
      githubFollowers: githubProfile.followers || 0,
      githubFollowing: githubProfile.following || 0,
    });

    res.json({
      profile: {
        id: githubProfile.id,
        login: githubProfile.login,
        name: githubProfile.name,
        avatar_url: githubProfile.avatar_url,
        html_url: githubProfile.html_url,
        bio: githubProfile.bio,
        public_repos: githubProfile.public_repos,
        followers: githubProfile.followers,
        following: githubProfile.following,
        created_at: githubProfile.created_at,
        updated_at: githubProfile.updated_at,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch GitHub profile', { error, userId: req.userId });
    res.status(500).json({ error: 'Failed to fetch GitHub profile' });
  }
});

/**
 * GET /api/github/repos
 * Get GitHub repositories for authenticated user
 */
router.get('/repos', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', per_page = '30', sort = 'updated', type = 'all', search = '' } = req.query;

    const user = await findUserById(Number(req.userId));

    if (!user || !user.github_connected || !user.github_access_token) {
      return res.status(400).json({ error: 'GitHub account not connected' });
    }

    const accessToken = decryptUserToken(user.github_access_token);

    // Build GitHub API URL
    let apiUrl = `https://api.github.com/user/repos?page=${page}&per_page=${per_page}&sort=${sort}&type=${type}`;

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        await disconnectUserGitHub(String(user._id));
        return res.status(401).json({ error: 'GitHub token expired. Please reconnect.' });
      }
      throw new Error('Failed to fetch repositories');
    }

    let repos = await response.json();

    // Client-side search filter
    if (search) {
      const searchLower = String(search).toLowerCase();
      repos = repos.filter((repo: any) =>
        repo.name.toLowerCase().includes(searchLower) ||
        repo.description?.toLowerCase().includes(searchLower)
      );
    }

    // Transform repo data
    const transformedRepos = repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      private: repo.private,
      html_url: repo.html_url,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      open_issues_count: repo.open_issues_count,
      updated_at: repo.updated_at,
      created_at: repo.created_at,
      default_branch: repo.default_branch,
    }));

    // Get pagination info from headers
    const linkHeader = response.headers.get('link');
    const totalCount = response.headers.get('x-total-count');

    res.json({
      repos: transformedRepos,
      pagination: {
        page: parseInt(page as string),
        per_page: parseInt(per_page as string),
        total: totalCount ? parseInt(totalCount) : transformedRepos.length,
        has_next: linkHeader?.includes('rel="next"') || false,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch GitHub repositories', { error, userId: req.userId });
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

/**
 * POST /api/github/disconnect
 * Disconnect GitHub account
 */
router.post('/disconnect', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await findUserById(Number(req.userId));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Clear GitHub data
    await disconnectUserGitHub(String(user._id));

    await createLog({
      userId: String(user._id),
      level: 'info',
      event: 'github_disconnect',
      message: 'GitHub account disconnected',
    });

    logger.info('GitHub account disconnected', { userId: String(user._id) });

    res.json({ message: 'GitHub account disconnected successfully' });
  } catch (error) {
    logger.error('Failed to disconnect GitHub account', { error, userId: req.userId });
    res.status(500).json({ error: 'Failed to disconnect GitHub account' });
  }
});

/**
 * POST /api/github/sync
 * Sync GitHub profile data
 */
router.post('/sync', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await findUserById(Number(req.userId));

    if (!user || !user.github_connected || !user.github_access_token) {
      return res.status(400).json({ error: 'GitHub account not connected' });
    }

    const accessToken = decryptUserToken(user.github_access_token);

    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        await disconnectUserGitHub(String(user._id));
        return res.status(401).json({ error: 'GitHub token expired. Please reconnect.' });
      }
      throw new Error('Failed to sync GitHub profile');
    }

    const githubProfile = await response.json();

    await updateUserGitHub(String(user._id), {
      githubUsername: githubProfile.login,
      githubAvatar: githubProfile.avatar_url,
      githubPublicRepos: githubProfile.public_repos || 0,
      githubFollowers: githubProfile.followers || 0,
      githubFollowing: githubProfile.following || 0,
      name: user.name || githubProfile.name,
    });

    await createLog({
      userId: String(user._id),
      level: 'info',
      event: 'github_sync',
      message: 'GitHub profile synced',
    });

    res.json({ message: 'GitHub profile synced successfully' });
  } catch (error) {
    logger.error('Failed to sync GitHub profile', { error, userId: req.userId });
    res.status(500).json({ error: 'Failed to sync GitHub profile' });
  }
});

export default router;
