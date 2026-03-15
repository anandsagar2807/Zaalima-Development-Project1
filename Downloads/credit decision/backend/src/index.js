const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectPostgreSQL, connectMongoDB } = require('./config/database');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth.routes');
const applicationRoutes = require('./routes/application.routes');
const documentRoutes = require('./routes/document.routes');
const scoringRoutes = require('./routes/scoring.routes');
const researchRoutes = require('./routes/research.routes');
const primaryInputRoutes = require('./routes/primaryInput.routes');
const camRoutes = require('./routes/cam.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const riskRoutes = require('./routes/risk.routes');
const companyRoutes = require('./routes/company.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/scoring', scoringRoutes);
app.use('/api/v1/research', researchRoutes);
app.use('/api/v1/primary-input', primaryInputRoutes);
app.use('/api/v1/cam', camRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/risk', riskRoutes);
app.use('/api/v1/companies', companyRoutes);
app.use('/api/v1/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'An unexpected error occurred',
      details: err.details || {},
      timestamp: new Date().toISOString()
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
      timestamp: new Date().toISOString()
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to databases
    await connectPostgreSQL();
    await connectMongoDB();
    
    app.listen(PORT, () => {
      logger.info(`🚀 Credit Decision Engine API running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;