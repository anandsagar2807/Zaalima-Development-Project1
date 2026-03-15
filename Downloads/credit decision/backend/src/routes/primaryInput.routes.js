const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth.middleware');
const { getPrismaClient, getMongoModels } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// GET /primary-input/:appId - Get primary input
router.get('/:appId', authenticateToken, [
  param('appId').isString().notEmpty()
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
    const { SiteVisit } = getMongoModels();

    const primaryInput = await prisma.primaryInput.findUnique({
      where: { applicationId: req.params.appId }
    });

    // Get site visit data from MongoDB
    const siteVisits = await SiteVisit.find({ applicationId: req.params.appId });

    res.json({
      success: true,
      data: {
        primaryInput,
        siteVisits
      }
    });
  } catch (error) {
    logger.error('Error fetching primary input:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch primary input' }
    });
  }
});

// POST /primary-input/:appId - Create/save primary input
router.post('/:appId', authenticateToken, [
  param('appId').isString().notEmpty(),
  body('managementExperience').optional().isInt({ min: 0, max: 50 }),
  body('managementQuality').optional().isInt({ min: 1, max: 10 }),
  body('promoterCredibility').optional().isInt({ min: 1, max: 10 }),
  body('capacityUtilization').optional().isFloat({ min: 0, max: 100 }),
  body('infrastructureRating').optional().isInt({ min: 1, max: 10 }),
  body('businessProspects').optional().isInt({ min: 1, max: 10 })
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
    const {
      siteVisitDate,
      capacityUtilization,
      inventoryQuality,
      employeeMorale,
      managementExperience,
      managementQuality,
      promoterCredibility,
      successionPlanning,
      keyRisks,
      mitigationFactors,
      infrastructureRating,
      businessProspects
    } = req.body;

    // Check if primary input exists
    const existing = await prisma.primaryInput.findUnique({
      where: { applicationId: req.params.appId }
    });

    let primaryInput;

    if (existing) {
      primaryInput = await prisma.primaryInput.update({
        where: { applicationId: req.params.appId },
        data: {
          siteVisitDate: siteVisitDate ? new Date(siteVisitDate) : undefined,
          capacityUtilization,
          inventoryQuality,
          employeeMorale,
          managementExperience,
          managementQuality,
          promoterCredibility,
          successionPlanning,
          keyRisks,
          mitigationFactors,
          officerId: req.user.userId,
          updatedAt: new Date()
        }
      });
    } else {
      primaryInput = await prisma.primaryInput.create({
        data: {
          id: uuidv4(),
          applicationId: req.params.appId,
          siteVisitDate: siteVisitDate ? new Date(siteVisitDate) : null,
          capacityUtilization,
          inventoryQuality,
          employeeMorale,
          managementExperience,
          managementQuality,
          promoterCredibility,
          successionPlanning,
          keyRisks,
          mitigationFactors,
          officerId: req.user.userId
        }
      });
    }

    logger.info(`Primary input saved for application: ${req.params.appId}`);

    res.json({
      success: true,
      data: primaryInput
    });
  } catch (error) {
    logger.error('Error saving primary input:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to save primary input' }
    });
  }
});

// PUT /primary-input/:appId - Update primary input
router.put('/:appId', authenticateToken, [
  param('appId').isString().notEmpty()
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

    const primaryInput = await prisma.primaryInput.update({
      where: { applicationId: req.params.appId },
      data: {
        ...req.body,
        officerId: req.user.userId,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: primaryInput
    });
  } catch (error) {
    logger.error('Error updating primary input:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update primary input' }
    });
  }
});

// POST /primary-input/:appId/adjust - Apply score adjustment
router.post('/:appId/adjust', authenticateToken, [
  param('appId').isString().notEmpty(),
  body('adjustment').isFloat({ min: -50, max: 50 }),
  body('reason').isString().notEmpty()
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
    const { adjustment, reason } = req.body;

    // Update primary input with adjustment
    const primaryInput = await prisma.primaryInput.update({
      where: { applicationId: req.params.appId },
      data: {
        scoreAdjustment: adjustment,
        adjustmentReason: reason
      }
    });

    // Update application score if exists
    const currentScore = await prisma.creditScore.findFirst({
      where: { applicationId: req.params.appId },
      orderBy: { calculatedAt: 'desc' }
    });

    if (currentScore) {
      const newScore = Math.max(0, Math.min(100, currentScore.totalScore + adjustment));
      const riskGrade = getGradeForScore(newScore);

      await prisma.creditScore.create({
        data: {
          id: uuidv4(),
          applicationId: req.params.appId,
          characterScore: currentScore.characterScore,
          capacityScore: currentScore.capacityScore,
          capitalScore: currentScore.capitalScore,
          collateralScore: currentScore.collateralScore,
          conditionsScore: currentScore.conditionsScore,
          totalScore: newScore,
          weightedScore: newScore,
          riskGrade: riskGrade,
          positiveFactors: [...(currentScore.positiveFactors || []), { factor: 'Manual Adjustment', impact: adjustment, details: reason }],
          negativeFactors: currentScore.negativeFactors || [],
          sensitivityAnalysis: currentScore.sensitivityAnalysis || []
        }
      });

      await prisma.application.update({
        where: { id: req.params.appId },
        data: {
          finalScore: newScore,
          riskGrade: riskGrade
        }
      });
    }

    logger.info(`Score adjustment applied for application: ${req.params.appId}`);

    res.json({
      success: true,
      data: {
        primaryInput,
        adjustment: {
          value: adjustment,
          reason,
          appliedBy: req.user.userId
        }
      }
    });
  } catch (error) {
    logger.error('Error applying adjustment:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to apply adjustment' }
    });
  }
});

// POST /visits/:appId - Log site visit
router.post('/visits/:appId', authenticateToken, [
  param('appId').isString().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const { SiteVisit } = getMongoModels();

    const {
      visitType,
      scheduledDate,
      conductedDate,
      location,
      observations,
      photos,
      keyFindings,
      followUpActions
    } = req.body;

    const siteVisit = new SiteVisit({
      _id: uuidv4(),
      applicationId: req.params.appId,
      visitType: visitType || 'INITIAL',
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      conductedDate: conductedDate ? new Date(conductedDate) : null,
      visitedBy: req.user.userId,
      status: conductedDate ? 'COMPLETED' : 'SCHEDULED',
      location,
      observations,
      photos: photos || [],
      keyFindings: keyFindings || [],
      followUpActions: followUpActions || []
    });

    await siteVisit.save();

    logger.info(`Site visit logged for application: ${req.params.appId}`);

    res.status(201).json({
      success: true,
      data: siteVisit
    });
  } catch (error) {
    logger.error('Error logging site visit:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to log site visit' }
    });
  }
});

// GET /visits/:appId - Get visit details
router.get('/visits/:appId', authenticateToken, async (req, res) => {
  try {
    const { SiteVisit } = getMongoModels();

    const visits = await SiteVisit.find({ applicationId: req.params.appId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: visits
    });
  } catch (error) {
    logger.error('Error fetching site visits:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch site visits' }
    });
  }
});

// POST /visits/:appId/photos - Upload visit photos
router.post('/visits/:appId/photos', authenticateToken, async (req, res) => {
  try {
    const { SiteVisit } = getMongoModels();
    const { visitId, photos } = req.body;

    if (!visitId || !photos || !Array.isArray(photos)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'visitId and photos array required' }
      });
    }

    const visit = await SiteVisit.findById(visitId);

    if (!visit) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Site visit not found' }
      });
    }

    visit.photos = [...visit.photos, ...photos];
    visit.updatedAt = new Date();
    await visit.save();

    res.json({
      success: true,
      data: visit
    });
  } catch (error) {
    logger.error('Error uploading photos:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to upload photos' }
    });
  }
});

// Helper function
function getGradeForScore(score) {
  const grades = [
    { min: 85, grade: 'A+' },
    { min: 75, grade: 'A' },
    { min: 65, grade: 'B+' },
    { min: 55, grade: 'B' },
    { min: 45, grade: 'C' },
    { min: 0, grade: 'D' }
  ];

  for (const g of grades) {
    if (score >= g.min) return g.grade;
  }
  return 'D';
}

module.exports = router;