import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export async function getSecurityIssuesController(req: AuthRequest, res: Response) {
  try {
    const { severity, repo } = req.query;

    let issues = [
      {
        id: 'sec-1',
        type: 'vulnerability',
        severity: 'critical',
        title: 'Hardcoded API credentials',
        description: 'API key found in source code',
        repository: 'gitguard-ai',
        file: 'src/config/api.ts',
        line: 12,
        status: 'open',
        detectedAt: new Date().toISOString(),
      },
      {
        id: 'sec-2',
        type: 'dependency',
        severity: 'high',
        title: 'Vulnerable dependency: lodash@4.17.15',
        description: 'Known security vulnerability in lodash version',
        repository: 'gitguard-ai',
        file: 'package.json',
        line: 45,
        status: 'open',
        detectedAt: new Date().toISOString(),
      },
      {
        id: 'sec-3',
        type: 'code',
        severity: 'medium',
        title: 'Missing input validation',
        description: 'User input not sanitized before use',
        repository: 'gitguard-ai',
        file: 'src/api/users.ts',
        line: 78,
        status: 'open',
        detectedAt: new Date().toISOString(),
      },
    ];

    // Apply filters
    if (severity) {
      issues = issues.filter(issue => issue.severity === severity);
    }
    if (repo) {
      issues = issues.filter(issue => issue.repository === repo);
    }

    res.json({ issues });
  } catch (error) {
    logger.error('Failed to fetch security issues', { error, userId: req.userId });
    res.status(500).json({ error: 'Failed to fetch security issues' });
  }
}

export async function updateSecurityIssueController(req: AuthRequest, res: Response) {
  try {
    const { id, status } = req.body;

    logger.info('Security issue updated', { id, status, userId: req.userId });

    res.json({ success: true, message: 'Security issue updated successfully' });
  } catch (error) {
    logger.error('Failed to update security issue', { error, userId: req.userId });
    res.status(500).json({ error: 'Failed to update security issue' });
  }
}
