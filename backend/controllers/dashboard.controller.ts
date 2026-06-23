import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getDashboardSummary } from '../services/dashboard.service';
import { logger } from '../utils/logger';

export async function getDashboardSummaryController(req: AuthRequest, res: Response) {
  try {
    const userId = Number(req.userId);
    const summary = await getDashboardSummary(userId);

    res.json({ summary });
  } catch (error) {
    logger.error('Failed to fetch dashboard summary', { error, userId: req.userId });
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
}
