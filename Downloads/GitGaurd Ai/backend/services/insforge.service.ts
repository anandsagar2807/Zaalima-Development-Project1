// Insforge Service - Wrapper with feature flag support
// When ENABLE_INSFORGE=false, returns mock data instead of calling external APIs

import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface InsforgeRepository {
  id: string;
  name: string;
  owner: string;
  status: 'active' | 'paused';
  strictMode: boolean;
  securityScan: boolean;
  autoFix: boolean;
  ignoreLint: boolean;
  lastAnalyzed: string;
  totalPRs: number;
  openPRs: number;
  scanScore: number;
  scanFindings: number;
  secretsRisk: boolean;
  scanSummary: string;
  languages: string[];
  hasWorkflows: boolean;
  hasTests: boolean;
}

export interface InsforgeReview {
  id: string;
  prId: string;
  type: 'bug' | 'security' | 'performance' | 'style';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  file: string;
  line: number;
  suggestion: string;
  autoFixAvailable: boolean;
  status: 'pending' | 'applied' | 'dismissed';
}

/**
 * Check if Insforge is enabled
 */
export function isInsforgeEnabled(): boolean {
  return env.enableInsforge && !!env.insforgeApiBaseUrl && !!env.insforgeApiKey;
}

/**
 * Generate mock AI review data when Insforge is disabled
 */
export function generateMockReview(prId: string, index: number): InsforgeReview {
  const types: Array<'bug' | 'security' | 'performance' | 'style'> = ['bug', 'security', 'performance', 'style'];
  const severities: Array<'critical' | 'high' | 'medium' | 'low'> = ['critical', 'high', 'medium', 'low'];

  const mockReviews = [
    {
      type: 'security' as const,
      severity: 'high' as const,
      title: 'Potential SQL Injection vulnerability',
      description: 'User input is directly concatenated into SQL query without sanitization',
      file: 'src/database/queries.ts',
      line: 45,
      suggestion: 'Use parameterized queries or an ORM to prevent SQL injection attacks',
      autoFixAvailable: true,
    },
    {
      type: 'bug' as const,
      severity: 'medium' as const,
      title: 'Possible null reference error',
      description: 'Object property accessed without null check',
      file: 'src/utils/helpers.ts',
      line: 128,
      suggestion: 'Add optional chaining or null check: user?.profile?.name',
      autoFixAvailable: true,
    },
    {
      type: 'performance' as const,
      severity: 'medium' as const,
      title: 'Inefficient loop operation',
      description: 'Array method called inside loop causing O(n²) complexity',
      file: 'src/services/data.service.ts',
      line: 67,
      suggestion: 'Use a Map or Set for O(1) lookups instead of array.find() in loop',
      autoFixAvailable: false,
    },
    {
      type: 'style' as const,
      severity: 'low' as const,
      title: 'Inconsistent naming convention',
      description: 'Variable name does not follow camelCase convention',
      file: 'src/components/UserCard.tsx',
      line: 23,
      suggestion: 'Rename user_data to userData',
      autoFixAvailable: true,
    },
  ];

  const review = mockReviews[index % mockReviews.length];

  return {
    id: `mock-review-${prId}-${index}`,
    prId,
    ...review,
    status: 'pending',
  };
}

/**
 * Fetch repositories from Insforge or return mock data
 */
export async function fetchInsforgeRepositories(userId: string): Promise<InsforgeRepository[]> {
  if (!isInsforgeEnabled()) {
    logger.info('Insforge disabled, returning mock repository data');
    return [];
  }

  try {
    // TODO: Implement actual Insforge API call when enabled
    logger.warn('Insforge API integration not yet implemented');
    return [];
  } catch (error) {
    logger.error('Failed to fetch Insforge repositories', { error, userId });
    return [];
  }
}

/**
 * Fetch AI reviews from Insforge or generate mock data
 */
export async function fetchInsforgeReviews(prId: string): Promise<InsforgeReview[]> {
  if (!isInsforgeEnabled()) {
    logger.info('Insforge disabled, generating mock review data', { prId });

    // Generate 2-4 mock reviews per PR
    const reviewCount = Math.floor(Math.random() * 3) + 2;
    return Array.from({ length: reviewCount }, (_, i) => generateMockReview(prId, i));
  }

  try {
    // TODO: Implement actual Insforge API call when enabled
    logger.warn('Insforge API integration not yet implemented');
    return [];
  } catch (error) {
    logger.error('Failed to fetch Insforge reviews', { error, prId });
    return [];
  }
}

/**
 * Store data to Insforge or skip if disabled
 */
export async function storeToInsforge(table: string, data: any): Promise<void> {
  if (!isInsforgeEnabled()) {
    logger.debug('Insforge disabled, skipping data storage', { table });
    return;
  }

  try {
    // TODO: Implement actual Insforge API call when enabled
    logger.warn('Insforge API integration not yet implemented');
  } catch (error) {
    logger.error('Failed to store to Insforge', { error, table });
  }
}
