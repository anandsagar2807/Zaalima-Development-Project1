const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { getPrismaClient } = require('../config/database');
const { authenticateToken } = require('../middleware/auth.middleware');
const { canTransitionStatus, withTransaction } = require('../utils/validators');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const prisma = getPrismaClient();

// Generate unique application number
const generateApplicationNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `APP-${year}-${random}`;
};

// GET /applications - List applications with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      stage,
      priority,
      assignedTo,
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (status) {
      where.status = status;
    }

    if (stage) {
      where.stage = stage;
    }

    if (priority) {
      where.priority = priority;
    }

    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    if (search) {
      where.OR = [
        { applicationNumber: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          company: {
            select: { id: true, name: true, cin: true, sector: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.application.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch applications'
      }
    });
  }
});

// GET /applications/stats - Application statistics for dashboard
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await prisma.$transaction([
      prisma.application.count(),
      prisma.application.count({ where: { status: 'PENDING' } }),
      prisma.application.count({ where: { status: 'APPROVED' } }),
      prisma.application.count({ where: { status: 'REJECTED' } }),
      prisma.application.aggregate({
        _sum: { loanAmount: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalApplications: stats[0],
        pending: stats[1],
        approved: stats[2],
        rejected: stats[3],
        totalExposure: stats[4]._sum.loanAmount || 0
      }
    });
  } catch (error) {
    logger.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch statistics'
      }
    });
  }
});

// GET /applications/:id - Get application details
router.get('/:id', authenticateToken, [
  param('id').isString().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        company: true,
        documents: true,
        scores: {
          orderBy: { calculatedAt: 'desc' },
          take: 1
        },
        primaryInput: true
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found' }
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    logger.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch application' }
    });
  }
});

// POST /applications - Create new application
router.post('/', authenticateToken, [
  body('companyId').isString().notEmpty(),
  body('loanAmount').isFloat({ min: 0 }),
  body('tenorMonths').isInt({ min: 1 }),
  body('purpose').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const { companyId, loanAmount, tenorMonths, purpose } = req.body;

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return res.status(400).json({
        success: false,
        error: { code: 'COMPANY_NOT_FOUND', message: 'Company not found' }
      });
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        id: uuidv4(),
        applicationNumber: generateApplicationNumber(),
        companyId,
        loanAmount,
        tenorMonths,
        purpose: purpose || '',
        status: 'PENDING',
        stage: 'DOCUMENT_UPLOAD',
        priority: 'MEDIUM'
      },
      include: {
        company: true
      }
    });

    logger.info(`Application created: ${application.applicationNumber}`);

    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error) {
    logger.error('Error creating application:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create application' }
    });
  }
});

// PUT /applications/:id - Update application
router.put('/:id', authenticateToken, [
  param('id').isString().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const { loanAmount, tenorMonths, purpose, priority, assignedTo } = req.body;

    const updateData = {};
    if (loanAmount !== undefined) updateData.loanAmount = loanAmount;
    if (tenorMonths !== undefined) updateData.tenorMonths = tenorMonths;
    if (purpose !== undefined) updateData.purpose = purpose;
    if (priority !== undefined) updateData.priority = priority;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

    const application = await prisma.application.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        company: true
      }
    });

    logger.info(`Application updated: ${application.applicationNumber}`);

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    logger.error('Error updating application:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update application' }
    });
  }
});

// PUT /applications/:id/status - Update application status
router.put('/:id/status', authenticateToken, [
  param('id').isString().notEmpty(),
  body('status').isIn(['DRAFT', 'SUBMITTED', 'MORE_INFO_REQUIRED', 'UNDER_REVIEW', 'APPROVED', 'SANCTIONED', 'DISBURSED', 'REJECTED', 'CANCELLED']),
  body('reason').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const prisma = getPrismaClient();
    const { status, reason } = req.body;
    const applicationId = req.params.id;

    // Get current application to validate transition
    const application = await prisma.application.findUnique({
      where: { id: applicationId }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found' }
      });
    }

    // Validate status transition
    if (!canTransitionStatus(application.status, status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TRANSITION',
          message: `Cannot transition from ${application.status} to ${status}. Valid transitions: ${require('../utils/validators').getValidNextStatuses(application.status).join(', ')}`
        }
      });
    }

    const updateData = {
      status,
      updatedAt: new Date()
    };

    // Set additional fields based on status
    if (['APPROVED', 'SANCTIONED', 'REJECTED'].includes(status)) {
      updateData.decisionDate = new Date();
      if (reason) {
        updateData.rejectionReason = reason;
      }
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: updateData
    });

    logger.info(`Application status updated: ${application.applicationNumber} -> ${status} by user ${req.user.userId}`);

    res.json({
      success: true,
      data: updatedApplication
    });
  } catch (error) {
    logger.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update status' }
    });
  }
});

// PUT /applications/:id/stage - Update application stage
router.put('/:id/stage', authenticateToken, [
  param('id').isString().notEmpty(),
  body('stage').isIn(['DOCUMENT_UPLOAD', 'VERIFICATION', 'SCORING', 'PRIMARY_INPUT', 'APPROVAL_PENDING', 'COMPLETED'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const { stage } = req.body;

    const application = await prisma.application.update({
      where: { id: req.params.id },
      data: {
        stage,
        updatedAt: new Date()
      }
    });

    logger.info(`Application stage updated: ${application.applicationNumber} -> ${stage}`);

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    logger.error('Error updating stage:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update stage' }
    });
  }
});

// PUT /applications/:id/priority - Set priority
router.put('/:id/priority', authenticateToken, [
  param('id').isString().notEmpty(),
  body('priority').isIn(['LOW', 'MEDIUM', 'HIGH'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const { priority } = req.body;

    const application = await prisma.application.update({
      where: { id: req.params.id },
      data: { priority }
    });

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    logger.error('Error updating priority:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update priority' }
    });
  }
});

// PUT /applications/:id/assign - Assign to credit officer
router.put('/:id/assign', authenticateToken, [
  param('id').isString().notEmpty(),
  body('officerId').isString().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const { officerId } = req.body;

    const application = await prisma.application.update({
      where: { id: req.params.id },
      data: {
        assignedTo: officerId,
        updatedAt: new Date()
      }
    });

    logger.info(`Application assigned: ${application.applicationNumber} -> ${officerId}`);

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    logger.error('Error assigning application:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to assign application' }
    });
  }
});

// DELETE /applications/:id - Delete application
router.delete('/:id', authenticateToken, [
  param('id').isString().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    await prisma.application.delete({
      where: { id: req.params.id }
    });

    logger.info(`Application deleted: ${req.params.id}`);

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting application:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete application' }
    });
  }
});

module.exports = router;