const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getPrismaClient } = require('../config/database');
const logger = require('../utils/logger');
const { authenticateToken } = require('../middleware/auth.middleware');

// Validation middleware
const validateLogin = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const validateRegister = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').isIn(['CREDIT_OFFICER', 'RISK_ANALYST', 'APPROVAL_AUTHORITY', 'ADMIN'])
    .withMessage('Invalid role')
];

// Generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// POST /auth/login - User login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { email, password } = req.body;
    const prisma = getPrismaClient();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_DISABLED',
          message: 'Account is disabled. Contact administrator.'
        }
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department,
          designation: user.designation
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during login'
      }
    });
  }
});

// POST /auth/refresh - Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: 'Refresh token required'
        }
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'default-secret');

    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token'
        }
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    res.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token'
      }
    });
  }
});

// POST /auth/register - Create new user (Admin only)
router.post('/register', validateRegister, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { email, password, name, role, department, designation } = req.body;
    const prisma = getPrismaClient();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists'
        }
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        department,
        designation
      }
    });

    logger.info(`New user created: ${email}`);

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during registration'
      }
    });
  }
});

// GET /auth/profile - Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        designation: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching profile'
      }
    });
  }
});

// PUT /auth/profile - Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, department, designation } = req.body;
    const prisma = getPrismaClient();

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        name,
        department,
        designation
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        designation: true
      }
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while updating profile'
      }
    });
  }
});

module.exports = router;