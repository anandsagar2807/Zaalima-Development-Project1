import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export async function getRulesController(req: AuthRequest, res: Response) {
  try {
    const rules = [
      {
        id: 'rule-1',
        name: 'Security Scan',
        description: 'Scan for security vulnerabilities and exposed secrets',
        category: 'security',
        enabled: true,
        severity: 'high',
      },
      {
        id: 'rule-2',
        name: 'Code Quality',
        description: 'Check code quality and best practices',
        category: 'quality',
        enabled: true,
        severity: 'medium',
      },
      {
        id: 'rule-3',
        name: 'Performance Analysis',
        description: 'Detect performance bottlenecks and inefficiencies',
        category: 'performance',
        enabled: true,
        severity: 'medium',
      },
      {
        id: 'rule-4',
        name: 'Style Consistency',
        description: 'Enforce code style and formatting rules',
        category: 'style',
        enabled: false,
        severity: 'low',
      },
      {
        id: 'rule-5',
        name: 'Test Coverage',
        description: 'Ensure adequate test coverage for changes',
        category: 'testing',
        enabled: true,
        severity: 'medium',
      },
    ];

    res.json({ rules });
  } catch (error) {
    logger.error('Failed to fetch rules', { error, userId: req.userId });
    res.status(500).json({ error: 'Failed to fetch rules' });
  }
}

export async function updateRuleController(req: AuthRequest, res: Response) {
  try {
    const { ruleId, enabled } = req.body;

    logger.info('Rule updated', { ruleId, enabled, userId: req.userId });

    res.json({ success: true, message: 'Rule updated successfully' });
  } catch (error) {
    logger.error('Failed to update rule', { error, userId: req.userId });
    res.status(500).json({ error: 'Failed to update rule' });
  }
}
