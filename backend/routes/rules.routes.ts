import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getRulesController, updateRuleController } from '../controllers/rules.controller';

const router = Router();

router.get('/', authMiddleware, getRulesController);
router.put('/', authMiddleware, updateRuleController);

export default router;
