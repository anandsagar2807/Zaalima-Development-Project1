import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getSecurityIssuesController, updateSecurityIssueController } from '../controllers/security.controller';

const router = Router();

router.get('/', authMiddleware, getSecurityIssuesController);
router.put('/', authMiddleware, updateSecurityIssueController);

export default router;
