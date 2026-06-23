import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getRepositoriesController, toggleRepositoryController } from '../controllers/repositories.controller';

const router = Router();

router.get('/', authMiddleware, getRepositoriesController);
router.put('/', authMiddleware, toggleRepositoryController);

export default router;
