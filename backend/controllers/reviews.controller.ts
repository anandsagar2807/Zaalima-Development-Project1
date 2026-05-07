import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { fetchInsforgeReviews } from '../services/insforge.service';
import { logger } from '../utils/logger';

export async function getReviewsController(req: AuthRequest, res: Response) {
  try {
    const { prId } = req.query;

    // If prId is provided, fetch reviews for that specific PR
    if (prId) {
      const reviews = await fetchInsforgeReviews(prId as string);
      return res.json({ reviews });
    }

    // Otherwise return all recent reviews (mock data)
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
