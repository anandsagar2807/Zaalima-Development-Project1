import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export async function getAnalyticsController(req: AuthRequest, res: Response) {
  try {
    const analytics = {
      totalPRs: 156,
      issuesDetected: 342,
      issuesFixed: 298,
      avgResponseTime: '2.3 min',
      securityIssues: 23,
      performanceIssues: 45,
      codeQualityScore: 87,
    };

    const prsPerDayData = [
      { date: '2026-04-27', count: 12 },
      { date: '2026-04-28', count: 15 },
      { date: '2026-04-29', count: 18 },
      { date: '2026-04-30', count: 14 },
      { date: '2026-05-01', count: 20 },
      { date: '2026-05-02', count: 16 },
      { date: '2026-05-03', count: 8 },
    ];

    const issuesBySeverity = [
      { severity: 'critical', count: 12 },
      { severity: 'high', count: 34 },
      { severity: 'medium', count: 89 },
      { severity: 'low', count: 207 },
    ];

    const securityVsBugData = [
      { category: 'Security', count: 23 },
      { category: 'Bugs', count: 145 },
      { category: 'Performance', count: 45 },
      { category: 'Style', count: 129 },
    ];

    res.json({
      analytics,
      prsPerDayData,
      issuesBySeverity,
      securityVsBugData,
    });
  } catch (error) {
    logger.error('Failed to fetch analytics', { error, userId: req.userId });
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}
