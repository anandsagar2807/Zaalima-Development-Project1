import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { findUserById, decryptUserToken } from '../services/user.service';
import { analyzeCodeWithAI } from '../services/ai-review.service';
import { logger } from '../utils/logger';

export async function getReviewsController(req: AuthRequest, res: Response) {
  try {
    const user = await findUserById(req.userId!);

    if (!user || !user.github_connected || !user.github_access_token) {
      return res.status(400).json({ error: 'GitHub account not connected' });
    }

    const { prId, repo, prNumber } = req.query;

    // If specific PR is requested, fetch and analyze it
    if (repo && prNumber) {
      const accessToken = decryptUserToken(user.github_access_token);

      // Fetch PR details from GitHub
      const prResponse = await fetch(
        `https://api.github.com/repos/${repo}/pulls/${prNumber}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (!prResponse.ok) {
        throw new Error('Failed to fetch PR from GitHub');
      }

      const pr = await prResponse.json();

      // Fetch PR diff
      const diffResponse = await fetch(pr.diff_url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3.diff',
        },
      });

      if (!diffResponse.ok) {
        throw new Error('Failed to fetch PR diff');
      }

      const diff = await diffResponse.text();

      // Analyze with AI (OpenRouter)
      const aiAnalysis = await analyzeCodeWithAI(diff, pr.title);

      return res.json({
        reviews: aiAnalysis.reviews || [],
        summary: aiAnalysis.summary,
        prDetails: {
          title: pr.title,
          number: pr.number,
          author: pr.user.login,
          state: pr.state,
        },
      });
    }

    // Otherwise return mock recent reviews
    const allReviews = [
      {
        id: 'review-1',
        prId: '1',
        type: 'security',
        severity: 'high',
        title: 'Potential SQL Injection vulnerability',
        description: 'User input is directly concatenated into SQL query',
        file: 'src/database/queries.ts',
        line: 45,
        suggestion: 'Use parameterized queries',
        autoFixAvailable: true,
        status: 'pending',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'review-2',
        prId: '1',
        type: 'bug',
        severity: 'medium',
        title: 'Possible null reference error',
        description: 'Object property accessed without null check',
        file: 'src/utils/helpers.ts',
        line: 128,
        suggestion: 'Add optional chaining: user?.profile?.name',
        autoFixAvailable: true,
        status: 'pending',
        timestamp: new Date().toISOString(),
      },
    ];

    res.json({ reviews: allReviews });
  } catch (error) {
    logger.error('Failed to fetch reviews', { error, userId: req.userId });
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}

export async function updateReviewController(req: AuthRequest, res: Response) {
  try {
    const { id, status } = req.body;

    logger.info('Review status updated', { id, status, userId: req.userId });

    res.json({ success: true, message: 'Review updated successfully' });
  } catch (error) {
    logger.error('Failed to update review', { error, userId: req.userId });
    res.status(500).json({ error: 'Failed to update review' });
  }
}
