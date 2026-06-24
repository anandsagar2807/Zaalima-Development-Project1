import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

/**
 * Connect to MongoDB using Mongoose.
 */
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

/**
 * Connect to MongoDB using Mongoose with automatic retry logic.
 * Cloud platforms (e.g. Render) may experience transient connection
 * failures on cold starts or network blips, so we retry a few times
 * before giving up.
 */
export const connectDatabase = async (): Promise<void> => {
  if (!env.mongoUri) {
    logger.warn('MONGO_URI not configured – running without database persistence');
    return;
  }

  // Set up connection event listeners once (before first connect attempt)
  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', { error: err.message });
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
  });

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(env.mongoUri);
      logger.info('MongoDB connected successfully');
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to connect to MongoDB (attempt ${attempt}/${MAX_RETRIES})`, {
        error: message,
      });

      if (attempt === MAX_RETRIES) {
        logger.error('Max MongoDB connection retries reached – giving up');
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
};

/**
 * Disconnect from MongoDB gracefully.
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};
