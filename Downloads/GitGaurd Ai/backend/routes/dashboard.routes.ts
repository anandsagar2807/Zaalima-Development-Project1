import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getDashboardSummaryController } from '../controllers/dashboard.controller';
import { getDashboardSummary } from '../services/dashboard.service';

const router = Router();

console.log('Dashboard routes module loading...');

// Test endpoint without auth (for development)
router.get('/summary-test', async (req, res) => {
  console.log('Summary-test endpoint hit!');
  try {
    const summary = await getDashboardSummary(1); // Mock user ID
    res.json({ summary });
  } catch (error) {
    console.error('Error in summary-test:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

router.get('/summary', authMiddleware, getDashboardSummaryController);

console.log('Dashboard routes registered:', router.stack.map((r: any) => r.route?.path));

export default router;
