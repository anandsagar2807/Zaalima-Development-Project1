import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { getDashboardSummaryController } from '../controllers/dashboard.controller';
import { getDashboardSummary } from '../services/dashboard.service';
import { Response } from 'express';

const router = Router();

console.log('Dashboard routes module loading...');

// Get current user data (used by frontend to check session)
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar_url,
        githubConnected: user.github_connected || false,
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
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// Test endpoint without auth (for development)
router.get('/summary-test', async (req, res) => {
  console.log('Summary-test endpoint hit!');
  try {
    const summary = await getDashboardSummary(1); // Mock user ID
    res.json({ summary });
  } catch (error) {
    console.error('Error in summary-test:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

router.get('/summary', authMiddleware, getDashboardSummaryController);

console.log('Dashboard routes registered:', router.stack.map((r: any) => r.route?.path));

export default router;
