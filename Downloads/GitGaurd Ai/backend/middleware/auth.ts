import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { findUserById } from '../services/user.service';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: any;
  userId?: string;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const payload = verifyToken(token);

    if (!payload) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    const user = await findUserById(Number(payload.userId));

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.user = user;
    req.userId = String(user.id);
    next();
  } catch (error) {
    logger.error('Authentication failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(401).json({ error: 'Authentication failed' });
  }
};
