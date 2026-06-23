import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getSettingsController, updateSettingsController } from '../controllers/settings.controller';

const router = Router();

router.get('/', authMiddleware, getSettingsController);
router.put('/', authMiddleware, updateSettingsController);

export default router;
