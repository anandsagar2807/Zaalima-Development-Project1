import { Pool } from 'pg';
import { env } from './env';
import { logger } from '../utils/logger';

let pool: Pool | null = null;

/**
 * Get or create the PostgreSQL connection pool.
 * Returns null if DATABASE_URL is not configured.
 */
export function getPool(): Pool | null {
  if (!env.databaseUrl) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString: env.databaseUrl,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      logger.error('Unexpected PostgreSQL pool error', { error: err.message });
    });

    pool.on('connect', () => {
      logger.info('PostgreSQL client connected to pool');
    });
  }

  return pool;
}

/**
 * Connect to PostgreSQL and verify the connection.
 */
export const connectDatabase = async (): Promise<void> => {
  const p = getPool();

  if (!p) {
    logger.warn('DATABASE_URL not configured – running without database persistence');
    return;
  }

  try {
    const client = await p.connect();
    logger.info('PostgreSQL connected successfully');
    client.release();
  } catch (error) {
    logger.error('Failed to connect to PostgreSQL', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};

/**
 * Disconnect from PostgreSQL gracefully.
 */
export const disconnectDatabase = async (): Promise<void> => {
  if (pool) {
    try {
      await pool.end();
      pool = null;
      logger.info('PostgreSQL disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting from PostgreSQL', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
};

/**
 * Get a guaranteed Pool (throws if DATABASE_URL is not configured).
 */
export function requirePool(): Pool {
  const p = getPool();
  if (!p) {
    throw new Error('DATABASE_URL is not configured');
  }
  return p;
}
