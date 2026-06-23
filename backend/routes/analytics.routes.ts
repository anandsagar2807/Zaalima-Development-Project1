import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getAnalyticsController } from '../controllers/analytics.controller';

const router = Router();

router.get('/', authMiddleware, getAnalyticsController);

export default router;
