import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getPerformanceIssuesController } from '../controllers/performance.controller';

const router = Router();

router.get('/', authMiddleware, getPerformanceIssuesController);

export default router;
