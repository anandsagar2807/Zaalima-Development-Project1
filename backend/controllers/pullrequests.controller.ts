import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export async function getPullRequestsController(req: AuthRequest, res: Response) {
  try {
    const { severity, type, autofix } = req.query;

    // Mock pull requests data
    let pullRequests = [
      {
        id: '1',
        number: 123,
        title: 'Add user authentication',
        repository: 'gitguard-ai',
        author: 'john-doe',
        status: 'open',
        severity: 'medium',
        type: 'feature',
        issuesFound: 3,
        hasAutoFix: true,
        createdAt: '2 hours ago',
        branch: 'feature/auth',
      },
      {
        id: '2',
        number: 122,
        title: 'Fix security vulnerability',
        repository: 'gitguard-ai',
        author: 'jane-smith',
        status: 'open',
        severity: 'high',
        type: 'security',
        issuesFound: 1,
        hasAutoFix: false,
        createdAt: '5 hours ago',
        branch: 'fix/security',
      },
    ];

    // Apply filters
    if (severity) {
      pullRequests = pullRequests.filter(pr => pr.severity === severity);
    }
    if (type) {
      pullRequests = pullRequests.filter(pr => pr.type === type);
    }
    if (autofix !== undefined) {
      const autofixBool = autofix === 'true';
      pullRequests = pullRequests.filter(pr => pr.hasAutoFix === autofixBool);
    }

    res.json({ pullRequests });
  } catch (error) {
    logger.error('Failed to fetch pull requests', { error, userId: req.userId });
    res.status(500).json({ error: 'Failed to fetch pull requests' });
  }
}

export async function getPullRequestController(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    // Mock single PR data
    const pullRequest = {
      id,
      number: 123,
      title: 'Add user authentication',
      repository: 'gitguard-ai',
      author: 'john-doe',
      status: 'open',
      severity: 'medium',
      type: 'feature',
      issuesFound: 3,
      hasAutoFix: true,
      createdAt: '2 hours ago',
      branch: 'feature/auth',
      description: 'Implements JWT-based authentication system',
      filesChanged: 12,
      additions: 450,
      deletions: 120,
    };

    res.json({ pullRequest });
  } catch (error) {
    logger.error('Failed to fetch pull request', { error, userId: req.userId, prId: req.params.id });
    res.status(500).json({ error: 'Failed to fetch pull request' });
  }
}
