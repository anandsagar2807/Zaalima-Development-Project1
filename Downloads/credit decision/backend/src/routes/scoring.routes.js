const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth.middleware');
const scoringService = require('../services/scoringService');
const { getPrismaClient, getMongoModels } = require('../config/database');
const logger = require('../utils/logger');

// POST /scoring/calculate/:appId - Calculate risk score
router.post('/calculate/:appId', authenticateToken, [
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

    const result = await scoringService.calculateScore(req.params.appId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error calculating score:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message || 'Failed to calculate score' }
    });
  }
});

// GET /scoring/score/:appId - Get current score
router.get('/score/:appId', authenticateToken, [
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

    const score = await prisma.creditScore.findFirst({
      where: { applicationId: req.params.appId },
      orderBy: { calculatedAt: 'desc' }
    });

    if (!score) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Score not found for this application' }
      });
    }

    res.json({
      success: true,
      data: score
    });
  } catch (error) {
    logger.error('Error fetching score:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch score' }
    });
  }
});

// GET /scoring/breakdown/:appId - Detailed score breakdown
router.get('/breakdown/:appId', authenticateToken, [
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
    const { Explanation } = getMongoModels();

    const score = await prisma.creditScore.findFirst({
      where: { applicationId: req.params.appId },
      orderBy: { calculatedAt: 'desc' }
    });

    if (!score) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Score not found' }
      });
    }

    // Get detailed explanation from MongoDB
    const explanation = await Explanation.findOne({
      applicationId: req.params.appId,
      scoreId: score.id
    });

    res.json({
      success: true,
      data: {
        score,
        explanation
      }
    });
  } catch (error) {
    logger.error('Error fetching breakdown:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch breakdown' }
    });
  }
});

// GET /scoring/explain/:appId - Explainability report
router.get('/explain/:appId', authenticateToken, [
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
    const { Explanation } = getMongoModels();

    const score = await prisma.creditScore.findFirst({
      where: { applicationId: req.params.appId },
      orderBy: { calculatedAt: 'desc' }
    });

    if (!score) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Score not found' }
      });
    }

    const explanation = await Explanation.findOne({
      applicationId: req.params.appId,
      scoreId: score.id
    });

    // Build explainability report
    const report = {
      summary: {
        totalScore: score.totalScore,
        riskGrade: score.riskGrade,
        recommendation: explanation?.recommendationLogic?.decision || 'N/A',
        confidence: explanation?.recommendationLogic?.confidence || 0
      },
      fiveCsBreakdown: {
        character: {
          score: score.characterScore,
          weight: 0.20,
          description: 'Promoter credibility, litigation history, track record',
          factors: explanation?.scoreBreakdown?.fiveCs?.character?.factors || []
        },
        capacity: {
          score: score.capacityScore,
          weight: 0.25,
          description: 'Financial capacity, cash flow, repayment ability',
          factors: explanation?.scoreBreakdown?.fiveCs?.capacity?.factors || []
        },
        capital: {
          score: score.capitalScore,
          weight: 0.20,
          description: 'Net worth, leverage, equity contribution',
          factors: explanation?.scoreBreakdown?.fiveCs?.capital?.factors || []
        },
        collateral: {
          score: score.collateralScore,
          weight: 0.15,
          description: 'Security coverage, asset quality',
          factors: explanation?.scoreBreakdown?.fiveCs?.collateral?.factors || []
        },
        conditions: {
          score: score.conditionsScore,
          weight: 0.20,
          description: 'Sector conditions, business environment',
          factors: explanation?.scoreBreakdown?.fiveCs?.conditions?.factors || []
        }
      },
      positiveFactors: score.positiveFactors,
      negativeFactors: score.negativeFactors,
      keyDrivers: explanation?.recommendationLogic?.keyDrivers || [],
      risks: explanation?.recommendationLogic?.risks || [],
      mitigants: explanation?.recommendationLogic?.mitigants || [],
      sensitivityAnalysis: score.sensitivityAnalysis
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('Error generating explanation:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate explanation' }
    });
  }
});

// GET /scoring/history/:appId - Score change history
router.get('/history/:appId', authenticateToken, [
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

    const history = await scoringService.getScoreHistory(req.params.appId);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    logger.error('Error fetching history:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch history' }
    });
  }
});

// POST /scoring/sensitivity/:appId - Run sensitivity analysis
router.post('/sensitivity/:appId', authenticateToken, [
  param('appId').isString().notEmpty(),
  body('scenarios').isArray()
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
    const { scenarios } = req.body;

    const currentScore = await prisma.creditScore.findFirst({
      where: { applicationId: req.params.appId },
      orderBy: { calculatedAt: 'desc' }
    });

    if (!currentScore) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'No score found for sensitivity analysis' }
      });
    }

    // Calculate sensitivity for each scenario
    const results = scenarios.map(scenario => {
      let impact = 0;

      switch (scenario.type) {
        case 'REVENUE_CHANGE':
          impact = scenario.value * -0.2; // -0.2 points per 1% revenue change
          break;
        case 'INTEREST_RATE':
          impact = scenario.value * -1; // -1 point per 1% rate increase
          break;
        case 'NEW_LITIGATION':
          impact = scenario.value * -10; // -10 points per litigation
          break;
        case 'LEVERAGE_CHANGE':
          impact = (scenario.value - 2) * -5; // -5 points per unit above 2
          break;
        default:
          impact = 0;
      }

      const newScore = Math.max(0, Math.min(100, currentScore.totalScore + impact));
      const newGrade = getGradeForScore(newScore);

      return {
        scenario: scenario.name,
        currentValue: scenario.value,
        impact,
        newScore,
        newGrade,
        passed: newScore >= 55
      };
    });

    res.json({
      success: true,
      data: {
        baseScore: currentScore.totalScore,
        baseGrade: currentScore.riskGrade,
        sensitivityResults: results
      }
    });
  } catch (error) {
    logger.error('Error running sensitivity:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to run sensitivity analysis' }
    });
  }
});

// GET /scoring/character/:appId - Character assessment
router.get('/character/:appId', authenticateToken, async (req, res) => {
  try {
    const prisma = getPrismaClient();
    const { Explanation } = getMongoModels();

    const score = await prisma.creditScore.findFirst({
      where: { applicationId: req.params.appId },
      orderBy: { calculatedAt: 'desc' }
    });

    if (!score) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Score not found' }
      });
    }

    const explanation = await Explanation.findOne({
      applicationId: req.params.appId,
      scoreId: score.id
    });

    res.json({
      success: true,
      data: {
        score: score.characterScore,
        weight: 0.20,
        litigationImpact: score.litigationImpact,
        factors: explanation?.scoreBreakdown?.fiveCs?.character?.factors || [],
        description: 'Character assessment based on promoter credibility, litigation history, and management track record'
      }
    });
  } catch (error) {
    logger.error('Error fetching character score:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch character assessment' }
    });
  }
});

// GET /scoring/capacity/:appId - Capacity assessment
router.get('/capacity/:appId', authenticateToken, async (req, res) => {
  try {
    const prisma = getPrismaClient();
    const { Explanation } = getMongoModels();

    const score = await prisma.creditScore.findFirst({
      where: { applicationId: req.params.appId },
      orderBy: { calculatedAt: 'desc' }
    });

    if (!score) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Score not found' }
      });
    }

    const explanation = await Explanation.findOne({
      applicationId: req.params.appId,
      scoreId: score.id
    });

    res.json({
      success: true,
      data: {
        score: score.capacityScore,
        weight: 0.25,
        financialRatioScore: score.financialRatioScore,
        gstAnalysisScore: score.gstAnalysisScore,
        bankStatementScore: score.bankStatementScore,
        factors: explanation?.scoreBreakdown?.fiveCs?.capacity?.factors || [],
        description: 'Capacity assessment based on financial ratios, cash flow, and repayment ability'
      }
    });
  } catch (error) {
    logger.error('Error fetching capacity score:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch capacity assessment' }
    });
  }
});

// GET /scoring/capital/:appId - Capital analysis
router.get('/capital/:appId', authenticateToken, async (req, res) => {
  try {
    const prisma = getPrismaClient();
    const { Explanation } = getMongoModels();

    const score = await prisma.creditScore.findFirst({
      where: { applicationId: req.params.appId },
      orderBy: { calculatedAt: 'desc' }
    });

    if (!score) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Score not found' }
      });
    }

    const explanation = await Explanation.findOne({
      applicationId: req.params.appId,
      scoreId: score.id
    });

    res.json({
      success: true,
      data: {
        score: score.capitalScore,
        weight: 0.20,
        factors: explanation?.scoreBreakdown?.fiveCs?.capital?.factors || [],
        description: 'Capital assessment based on net worth, leverage, and equity contribution'
      }
    });
  } catch (error) {
    logger.error('Error fetching capital score:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch capital assessment' }
    });
  }
});

// GET /scoring/collateral/:appId - Collateral assessment
router.get('/collateral/:appId', authenticateToken, async (req, res) => {
  try {
    const prisma = getPrismaClient();
    const { Explanation } = getMongoModels();

    const score = await prisma.creditScore.findFirst({
      where: { applicationId: req.params.appId },
      orderBy: { calculatedAt: 'desc' }
    });

    if (!score) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Score not found' }
      });
    }

    const explanation = await Explanation.findOne({
      applicationId: req.params.appId,
      scoreId: score.id
    });

    res.json({
      success: true,
      data: {
        score: score.collateralScore,
        weight: 0.15,
        factors: explanation?.scoreBreakdown?.fiveCs?.collateral?.factors || [],
        description: 'Collateral assessment based on security coverage and asset quality'
      }
    });
  } catch (error) {
    logger.error('Error fetching collateral score:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch collateral assessment' }
    });
  }
});

// GET /scoring/conditions/:appId - Business conditions
router.get('/conditions/:appId', authenticateToken, async (req, res) => {
  try {
    const prisma = getPrismaClient();
    const { Explanation } = getMongoModels();

    const score = await prisma.creditScore.findFirst({
      where: { applicationId: req.params.appId },
      orderBy: { calculatedAt: 'desc' }
    });

    if (!score) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Score not found' }
      });
    }

    const explanation = await Explanation.findOne({
      applicationId: req.params.appId,
      scoreId: score.id
    });

    res.json({
      success: true,
      data: {
        score: score.conditionsScore,
        weight: 0.20,
        sectorRiskImpact: score.sectorRiskImpact,
        factors: explanation?.scoreBreakdown?.fiveCs?.conditions?.factors || [],
        description: 'Conditions assessment based on sector conditions and business environment'
      }
    });
  } catch (error) {
    logger.error('Error fetching conditions score:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch conditions assessment' }
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