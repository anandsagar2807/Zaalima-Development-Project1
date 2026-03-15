const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth.middleware');
const { getPrismaClient } = require('../config/database');
const logger = require('../utils/logger');

const prisma = getPrismaClient();

// Helper to handle validation errors
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

// GET /companies - list companies with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      sector,
      status,
      scale
    } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { cin: { contains: search, mode: 'insensitive' } },
        { gstin: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (sector) {
      where.sector = { contains: sector, mode: 'insensitive' };
    }

    if (status) {
      where.status = status;
    }

    if (scale) {
      where.scale = scale;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.company.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        companies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch companies' }
    });
  }
});

// GET /companies/:id - fetch single company
router.get('/:id', authenticateToken, [param('id').isString().notEmpty()], async (req, res) => {
  if (!handleValidation(req, res)) return;

  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
      include: {
        applications: { orderBy: { createdAt: 'desc' }, take: 5 },
        gstAnalysis: { orderBy: { analyzedAt: 'desc' }, take: 1 }
      }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Company not found' }
      });
    }

    res.json({ success: true, data: company });
  } catch (error) {
    logger.error('Error fetching company:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch company' }
    });
  }
});

const companyValidators = [
  body('name').isString().notEmpty(),
  body('cin').optional().isString(),
  body('gstin').optional().isString(),
  body('pan').optional().isString(),
  body('sector').optional().isString(),
  body('scale').optional().isIn(['SME', 'MID_CORPORATE', 'LARGE_CORPORATE']),
  body('status').optional().isIn(['ACTIVE', 'DEFAULTER', 'NCLT', 'WINDING_UP']),
  body('email').optional().isEmail(),
  body('phone').optional().isString(),
  body('address').optional().isString(),
  body('city').optional().isString(),
  body('state').optional().isString(),
  body('pincode').optional().isString()
];

// POST /companies - create company
router.post('/', authenticateToken, companyValidators, async (req, res) => {
  if (!handleValidation(req, res)) return;

  try {
    const company = await prisma.company.create({ data: req.body });
    res.status(201).json({ success: true, data: company });
  } catch (error) {
    logger.error('Error creating company:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create company' }
    });
  }
});

// PUT /companies/:id - update company
router.put('/:id', authenticateToken, [param('id').isString().notEmpty(), ...companyValidators], async (req, res) => {
  if (!handleValidation(req, res)) return;

  try {
    const company = await prisma.company.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json({ success: true, data: company });
  } catch (error) {
    logger.error('Error updating company:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Company not found' }
      });
    }
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update company' }
    });
  }
});

// DELETE /companies/:id - delete company
router.delete('/:id', authenticateToken, [param('id').isString().notEmpty()], async (req, res) => {
  if (!handleValidation(req, res)) return;

  try {
    await prisma.company.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Company deleted' });
  } catch (error) {
    logger.error('Error deleting company:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete company' }
    });
  }
});

module.exports = router;
