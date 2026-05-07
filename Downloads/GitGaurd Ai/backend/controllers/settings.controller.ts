import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export async function getSettingsController(req: AuthRequest, res: Response) {
  try {
    const settings = {
      notifications: {
        email: true,
        slack: false,
        discord: false,
      },
      analysis: {
        autoReview: true,
        strictMode: true,
        securityScan: true,
        performanceScan: true,
        styleScan: false,
      },
      autoFix: {
        enabled: true,
        requireApproval: true,
        maxChanges: 10,
      },
      integrations: {
        github: true,
        gitlab: false,
        bitbucket: false,
      },
    };

    res.json({ settings });
  } catch (error) {
    logger.error('Failed to fetch settings', { error, userId: req.userId });
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
}

export async function updateSettingsController(req: AuthRequest, res: Response) {
  try {
    const newSettings = req.body;

    logger.info('Settings updated', { userId: req.userId, settings: newSettings });

    res.json({ success: true, settings: newSettings });
  } catch (error) {
    logger.error('Failed to update settings', { error, userId: req.userId });
    res.status(500).json({ error: 'Failed to update settings' });
  }
}
