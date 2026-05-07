import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export async function getRepositoriesController(req: AuthRequest, res: Response) {
  try {
    // Mock repositories data
    const repositories = [
      {
        id: '1',
        name: 'gitguard-ai',
        owner: 'your-org',
        status: 'active',
        strictMode: true,
        securityScan: true,
        autoFix: true,
        ignoreLint: false,
        lastAnalyzed: '2 hours ago',
        totalPRs: 45,
        openPRs: 3,
        scanScore: 92,
        scanFindings: 2,
        secretsRisk: false,
        scanSummary: 'Healthy baseline; only low-risk items detected.',
        languages: ['TypeScript', 'JavaScript'],
        hasWorkflows: true,
        hasTests: true,
      },
    ];

    res.json({ repositories });
  } catch (error) {
    logger.error('Failed to fetch repositories', { error, userId: req.userId });
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
}

export async function toggleRepositoryController(req: AuthRequest, res: Response) {
  try {
    const { id, field } = req.body;

    logger.info('Repository toggle requested', { id, field, userId: req.userId });

    res.json({ success: true, message: 'Repository updated successfully' });
  } catch (error) {
    logger.error('Failed to toggle repository', { error, userId: req.userId });
    res.status(500).json({ error: 'Failed to update repository' });
  }
}
