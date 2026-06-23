import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getReviewsController, updateReviewController } from '../controllers/reviews.controller';

const router = Router();

router.get('/', authMiddleware, getReviewsController);
router.get('/history', authMiddleware, getReviewsController);
router.put('/', authMiddleware, updateReviewController);

export default router;
