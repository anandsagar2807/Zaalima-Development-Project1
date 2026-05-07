import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export async function getWebhookLogsController(req: AuthRequest, res: Response) {
  try {
    const { status } = req.query;

    let logs = [
      {
        id: 'log-1',
        event: 'pull_request.opened',
        status: 'success',
        repository: 'gitguard-ai',
        prNumber: '#123',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        duration: '1.2s',
        details: 'Analysis completed successfully',
      },
      {
        id: 'log-2',
        event: 'pull_request.synchronize',
        status: 'success',
        repository: 'gitguard-ai',
        prNumber: '#122',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        duration: '2.1s',
        details: 'Analysis completed successfully',
      },
      {
        id: 'log-3',
        event: 'pull_request.opened',
        status: 'pending',
        repository: 'gitguard-ai',
        prNumber: '#124',
        timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        duration: '-',
        details: 'Analysis in progress...',
      },
      {
        id: 'log-4',
        event: 'pull_request.closed',
        status: 'failed',
        repository: 'gitguard-ai',
        prNumber: '#121',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        duration: '0.5s',
        details: 'Error: Analysis failed',
      },
    ];

    // Apply filters
    if (status) {
      logs = logs.filter(log => log.status === status);
    }

    res.json({ logs });
  } catch (error) {
    logger.error('Failed to fetch webhook logs', { error, userId: req.userId });
    res.status(500).json({ error: 'Failed to fetch webhook logs' });
  }
}
