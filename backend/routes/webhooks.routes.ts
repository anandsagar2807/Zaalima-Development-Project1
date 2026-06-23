import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getWebhookLogsController } from '../controllers/logs.controller';

const router = Router();

router.get('/', authMiddleware, getWebhookLogsController);

export default router;
