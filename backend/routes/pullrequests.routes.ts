import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getPullRequestsController, getPullRequestController } from '../controllers/pullrequests.controller';

const router = Router();

router.get('/', authMiddleware, getPullRequestsController);
router.get('/:id', authMiddleware, getPullRequestController);

export default router;
