import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export async function getPerformanceIssuesController(req: AuthRequest, res: Response) {
  try {
    const issues = [
      {
        id: 'perf-1',
        type: 'algorithm',
        severity: 'high',
        title: 'O(n²) complexity in data processing',
        description: 'Nested loops causing performance bottleneck',
        repository: 'gitguard-ai',
        file: 'src/services/data.service.ts',
        line: 156,
        impact: 'High CPU usage on large datasets',
        suggestion: 'Use hash map for O(n) lookup',
      },
      {
        id: 'perf-2',
        type: 'memory',
        severity: 'medium',
        title: 'Memory leak in event listeners',
        description: 'Event listeners not properly cleaned up',
        repository: 'gitguard-ai',
        file: 'src/components/Dashboard.tsx',
        line: 89,
        impact: 'Memory usage grows over time',
        suggestion: 'Add cleanup in useEffect return',
      },
      {
        id: 'perf-3',
        type: 'network',
        severity: 'medium',
        title: 'Unnecessary API calls in render',
        description: 'API called on every render without memoization',
        repository: 'gitguard-ai',
        file: 'src/hooks/useData.ts',
        line: 23,
        impact: 'Excessive network requests',
        suggestion: 'Use useMemo or move outside render',
      },
    ];

    res.json({ issues });
  } catch (error) {
    logger.error('Failed to fetch performance issues', { error, userId: req.userId });
    res.status(500).json({ error: 'Failed to fetch performance issues' });
  }
}
