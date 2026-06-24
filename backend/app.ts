import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth.routes';
import githubRoutes from './routes/github.routes';
import dashboardRoutes from './routes/dashboard.routes';
import repositoriesRoutes from './routes/repositories.routes';
import pullRequestsRoutes from './routes/pullrequests.routes';
import reviewsRoutes from './routes/reviews.routes';
import securityRoutes from './routes/security.routes';
import performanceRoutes from './routes/performance.routes';
import rulesRoutes from './routes/rules.routes';
import settingsRoutes from './routes/settings.routes';
import analyticsRoutes from './routes/analytics.routes';
import webhooksRoutes from './routes/webhooks.routes';
import { logger } from './utils/logger';
import { githubWebhookRouter } from './routes/githubWebhook.route';
import { env } from './config/env';

export function createApp(): Express {
  const app = express();

  // Trust the first proxy hop so that req.protocol / req.ip reflect the
  // original client request (https) when running behind Render's reverse
  // proxy. Without this, req.protocol returns "http" and dynamic OAuth
  // callback URLs would be computed incorrectly.
  app.set('trust proxy', 1);

  // Connect to PostgreSQL
  connectDatabase().catch((error) => {
    logger.error('Failed to connect to database', { error });
    // Don't exit – allow the server to start even without DB (webhook route can still work)
  });

  // Middleware — CORS configured for cross-origin (Vercel frontend → Render backend)
  const allowedOrigins = [
    env.frontendUrl,                              // e.g. http://localhost:3000 (dev) or https://your-app.vercel.app (prod)
    'https://git-gaurd-ai.vercel.app',            // Vercel production deployment
    'https://git-gaurd-ai-git-main.vercel.app',   // Vercel preview branch deployment
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (curl, server-to-server, health checks)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        // Allow any Vercel preview deployment for this project
        if (origin.endsWith('.vercel.app')) {
          return callback(null, true);
        }
        callback(new Error(`CORS blocked origin: ${origin}`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Apply rate limiting to all routes
  app.use(apiRateLimiter);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Test route directly on app
  app.get('/api/test', (req, res) => {
    console.log('Test route hit!');
    res.json({ message: 'Direct route works!' });
  });
  console.log('Test route registered at /api/test');

  // Auth Routes - ONLY use /api/auth prefix
  app.use('/api/auth', authRoutes);

  // API Routes
  console.log('Registering API routes...');
  console.log('Dashboard routes:', typeof dashboardRoutes);
  app.use('/api/github', githubRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/repositories', repositoriesRoutes);
  app.use('/api/pull-requests', pullRequestsRoutes);
  app.use('/api/reviews', reviewsRoutes);
  app.use('/api/ai-reviews', reviewsRoutes);
  app.use('/api/security', securityRoutes);
  app.use('/api/performance', performanceRoutes);
  app.use('/api/rules', rulesRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/webhooks', webhooksRoutes);
  app.use('/api/logs', webhooksRoutes);
  console.log('API routes registered');

  // GitHub Webhook
  app.use(githubWebhookRouter);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
