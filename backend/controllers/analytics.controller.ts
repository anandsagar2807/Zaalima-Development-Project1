import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export async function getAnalyticsController(req: AuthRequest, res: Response) {
  try {
    // Fields must match the frontend Analytics interface exactly:
    // totalPRs, issuesDetected, securityWarnings, performanceWarnings, avgResponseTime (number), autoFixes
    const analytics = {
      totalPRs: 156,
      issuesDetected: 342,
      securityWarnings: 23,
      performanceWarnings: 45,
      avgResponseTime: 2.3,
      autoFixes: 298,
    };

    // Frontend expects: { day, prs, issues }[]
    const prsPerDayData = [
      { day: 'Mon', prs: 12, issues: 5 },
      { day: 'Tue', prs: 15, issues: 8 },
      { day: 'Wed', prs: 18, issues: 3 },
      { day: 'Thu', prs: 14, issues: 6 },
      { day: 'Fri', prs: 20, issues: 10 },
      { day: 'Sat', prs: 16, issues: 4 },
      { day: 'Sun', prs: 8, issues: 2 },
    ];

    // Frontend expects: { name, value, color }[]
    const issuesBySeverity = [
      { name: 'Critical', value: 12, color: '#ef4444' },
      { name: 'High', value: 34, color: '#f97316' },
      { name: 'Medium', value: 89, color: '#eab308' },
      { name: 'Low', value: 207, color: '#22c55e' },
    ];

    // Frontend expects: { name, value }[]
    const securityVsBugData = [
      { name: 'Security', value: 23 },
      { name: 'Bugs', value: 145 },
      { name: 'Performance', value: 45 },
      { name: 'Style', value: 129 },
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
