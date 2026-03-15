const express = require('express');
const router = express.Router();
const { query, param, body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth.middleware');
const { getPrismaClient } = require('../config/database');
const logger = require('../utils/logger');

const prisma = getPrismaClient();

const requireAdmin = (req, res, next) => {
  if (!['ADMIN', 'APPROVAL_AUTHORITY'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Admin privileges required' }
    });
  }
  next();
};

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', details: errors.array() }
    });
    return false;
  }
  return true;
};

// GET /users - list users for admin console
router.get('/', authenticateToken, requireAdmin, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  if (!handleValidation(req, res)) return;

  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.isActive = status === 'active';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          department: true,
          designation: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Error listing users:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch users' }
    });
  }
});

// PATCH /users/:id/status - toggle active flag
router.patch('/:id/status', authenticateToken, requireAdmin, [
  param('id').isString().notEmpty(),
  body('isActive').isBoolean()
], async (req, res) => {
  if (!handleValidation(req, res)) return;

  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: req.body.isActive }
    });

    res.json({
      success: true,
      data: {
        id: user.id,
        isActive: user.isActive
      }
    });
  } catch (error) {
    logger.error('Error updating user status:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' }
      });
    }
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update user' }
    });
  }
});

// GET /users/roles - supported roles for UI
router.get('/meta/roles', authenticateToken, requireAdmin, async (req, res) => {
  res.json({
    success: true,
    data: ['CREDIT_OFFICER', 'RISK_ANALYST', 'APPROVAL_AUTHORITY', 'ADMIN']
  });
});

module.exports = router;
