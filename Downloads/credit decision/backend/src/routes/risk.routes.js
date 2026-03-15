const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth.middleware');
const { getPrismaClient, getMongoModels } = require('../config/database');
const circularTradingService = require('../services/circularTradingService');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// GET /risk/flags/:appId - List risk flags
router.get('/flags/:appId', authenticateToken, [
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

    const { Extraction, CircularTrading, Intelligence } = getMongoModels();

    // Get risk flags from extractions
    const extractions = await Extraction.find({ applicationId: req.params.appId });
    const allFlags = extractions.flatMap(e => e.riskFlags || []);

    // Get circular trading flags
    const circularTrading = await CircularTrading.findOne({ applicationId: req.params.appId });

    // Get intelligence risk indicators
    const intelligence = await Intelligence.find({
      applicationId: req.params.appId,
      riskImpact: { $in: ['HIGH_RISK', 'CRITICAL', 'MEDIUM_RISK'] }
    });

    // Get litigation data
    const prisma = getPrismaClient();
    const litigations = await prisma.litigation.findMany({
      where: { applicationId: req.params.appId }
    });

    // Compile all risk flags
    const riskFlags = {
      documentFlags: allFlags.map(f => ({
        ...f,
        source: 'Document Analysis'
      })),
      circularTrading: circularTrading ? {
        detected: true,
        riskLevel: circularTrading.riskLevel,
        suspiciousSuppliers: circularTrading.suspiciousSuppliers?.length || 0,
        percentageOfTotal: circularTrading.percentageOfTotal
      } : null,
      intelligenceFlags: intelligence.map(i => ({
        type: i.riskImpact,
        source: i.source,
        title: i.title,
        categories: i.riskCategories
      })),
      litigationFlags: litigations.map(l => ({
        type: l.caseType,
        severity: l.severity,
        status: l.status,
        amount: l.claimAmount
      }))
    };

    // Calculate overall risk summary
    const summary = {
      totalFlags: allFlags.length + litigations.length + intelligence.length,
      criticalCount: allFlags.filter(f => f.severity === 'HIGH').length +
        litigations.filter(l => l.severity === 'CRITICAL').length +
        intelligence.filter(i => i.riskImpact === 'CRITICAL').length,
      highCount: allFlags.filter(f => f.severity === 'HIGH').length +
        litigations.filter(l => l.severity === 'HIGH').length,
      mediumCount: allFlags.filter(f => f.severity === 'MEDIUM').length +
        litigations.filter(l => l.severity === 'MEDIUM').length,
      circularTradingDetected: !!circularTrading
    };

    res.json({
      success: true,
      data: {
        flags: riskFlags,
        summary
      }
    });
  } catch (error) {
    logger.error('Error fetching risk flags:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch risk flags' }
    });
  }
});

// POST /risk/analyze/:appId - Deep risk analysis
router.post('/analyze/:appId', authenticateToken, [
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
    const { Extraction, CircularTrading, Intelligence } = getMongoModels();

    const application = await prisma.application.findUnique({
      where: { id: req.params.appId },
      include: { company: true, litigationRecords: true }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found' }
      });
    }

    // Perform various risk analyses
    const analyses = {};

    // 1. Financial Risk Analysis
    const extractions = await Extraction.find({ applicationId: req.params.appId });
    analyses.financial = analyzeFinancialRisk(extractions);

    // 2. GST Reconciliation Risk
    analyses.gstReconciliation = await analyzeGSTRisk(extractions);

    // 3. Circular Trading Analysis
    analyses.circularTrading = await analyzeCircularTrading(req.params.appId, CircularTrading);

    // 4. Litigation Risk
    analyses.litigation = analyzeLitigationRisk(application.litigationRecords);

    // 5. Reputation Risk
    const intelligence = await Intelligence.find({ applicationId: req.params.appId });
    analyses.reputation = analyzeReputationRisk(intelligence);

    // 6. Sector Risk
    analyses.sector = analyzeSectorRisk(application.company?.sector);

    // Calculate overall risk score
    const overallRiskScore = calculateOverallRiskScore(analyses);

    res.json({
      success: true,
      data: {
        analyses,
        overallRiskScore,
        riskLevel: getRiskLevel(overallRiskScore),
        recommendations: generateRecommendations(analyses)
      }
    });
  } catch (error) {
    logger.error('Error performing risk analysis:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to perform risk analysis' }
    });
  }
});

// GET /risk/summary/:appId - Risk summary report
router.get('/summary/:appId', authenticateToken, async (req, res) => {
  try {
    const prisma = getPrismaClient();
    const { Extraction, CircularTrading, Intelligence } = getMongoModels();

    const application = await prisma.application.findUnique({
      where: { id: req.params.appId },
      include: {
        company: true,
        litigationRecords: true,
        scores: { orderBy: { calculatedAt: 'desc' }, take: 1 }
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found' }
      });
    }

    const extractions = await Extraction.find({ applicationId: req.params.appId });
    const circularTrading = await CircularTrading.findOne({ applicationId: req.params.appId });
    const intelligence = await Intelligence.find({ applicationId: req.params.appId });

    const score = application.scores[0];

    const summary = {
      applicationNumber: application.applicationNumber,
      companyName: application.company?.name,
      riskScore: score?.totalScore,
      riskGrade: application.riskGrade,

      riskCategories: {
        financial: {
          status: getRiskStatus(extractions, 'financial'),
          flags: extractions.flatMap(e => e.riskFlags?.filter(f => f.type?.includes('FINANCIAL')) || [])
        },
        operational: {
          status: 'moderate',
          flags: []
        },
        legal: {
          status: application.litigationRecords?.length > 0 ? 'elevated' : 'low',
          cases: application.litigationRecords?.length || 0
        },
        reputational: {
          status: intelligence.filter(i => i.sentiment?.category === 'NEGATIVE').length > 2 ? 'elevated' : 'low',
          negativeMentions: intelligence.filter(i => i.sentiment?.category === 'NEGATIVE').length
        }
      },

      keyRisks: extractKeyRisks(extractions, application.litigationRecords, circularTrading, intelligence),
      mitigatingFactors: extractMitigatingFactors(score),

      circularTrading: circularTrading ? {
        detected: true,
        riskLevel: circularTrading.riskLevel
      } : { detected: false },

      recommendation: score?.totalScore >= 65 ? 'APPROVE' :
        score?.totalScore >= 55 ? 'APPROVE_WITH_CONDITIONS' :
          score?.totalScore >= 45 ? 'REVIEW' : 'REJECT'
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    logger.error('Error generating risk summary:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate risk summary' }
    });
  }
});

// POST /risk/circular-trading - Detect circular trading
router.post('/circular-trading', authenticateToken, [
  body('applicationId').isString().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const { applicationId } = req.body;
    const { Extraction, CircularTrading } = getMongoModels();

    // Get GST data
    const gstExtractions = await Extraction.find({
      applicationId,
      documentType: { $in: ['GST_RETURN_1', 'GST_2A', 'GST_RETURN_3B'] }
    });

    // Perform circular trading detection (simplified algorithm)
    const detection = await detectCircularTrading(applicationId, gstExtractions);

    // Save results
    const circularTrading = new CircularTrading({
      _id: uuidv4(),
      applicationId,
      companyId: gstExtractions[0]?.companyId || '',
      ...detection
    });

    await circularTrading.save();

    res.json({
      success: true,
      data: circularTrading
    });
  } catch (error) {
    logger.error('Error detecting circular trading:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to detect circular trading' }
    });
  }
});

// POST /risk/gst-reconciliation - GST-Bank mismatch analysis
router.post('/gst-reconciliation', authenticateToken, [
  body('applicationId').isString().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const { applicationId } = req.body;
    const { Extraction } = getMongoModels();
    const prisma = getPrismaClient();

    // Get GST and Bank data
    const gstExtraction = await Extraction.findOne({
      applicationId,
      documentType: 'GST_RETURN_1'
    });

    const bankExtraction = await Extraction.findOne({
      applicationId,
      documentType: 'BANK_STATEMENT'
    });

    const gstTurnover = gstExtraction?.extractedData?.gstData?.totalTaxableValue || 0;
    const bankCredits = bankExtraction?.extractedData?.bankData?.totalCredits || 0;

    // Calculate variance
    const variance = gstTurnover > 0 ?
      Math.abs(gstTurnover - bankCredits) / gstTurnover * 100 : 0;

    const reconciliation = {
      gstTurnover,
      bankCredits,
      variance: variance.toFixed(2),
      isReconciled: variance < 20,
      riskLevel: variance > 30 ? 'HIGH' : variance > 20 ? 'MEDIUM' : 'LOW',
      analysis: {
        matchesWithinTolerance: variance < 10,
        requiresExplanation: variance >= 10 && variance < 30,
        significantMismatch: variance >= 30
      },
      possibleReasons: variance >= 10 ? [
        'Export sales not reflected in bank credits',
        'Cash transactions',
        'Timing differences in recording',
        'Unreported income'
      ] : []
    };

    // Save analysis
    await prisma.gSTAnalysis.create({
      data: {
        id: uuidv4(),
        applicationId,
        companyId: gstExtraction?.companyId || '',
        gstr1Turnover: gstTurnover,
        bankTurnover: bankCredits,
        turnoverVariance: parseFloat(variance.toFixed(2)),
        mismatchPercentage: parseFloat(variance.toFixed(2)),
        circularTradingFlag: false
      }
    });

    res.json({
      success: true,
      data: reconciliation
    });
  } catch (error) {
    logger.error('Error in GST reconciliation:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to perform GST reconciliation' }
    });
  }
});

// GET /risk/sector/:sector - Sector risk indicators
router.get('/sector/:sector', authenticateToken, async (req, res) => {
  try {
    const { sector } = req.params;

    const sectorRisks = {
      'IT_SERVICES': {
        riskLevel: 'LOW',
        factors: ['Stable demand', 'Export oriented', 'High margins'],
        concerns: ['Currency fluctuation', 'Talent retention'],
        outlook: 'POSITIVE'
      },
      'MANUFACTURING': {
        riskLevel: 'MEDIUM',
        factors: ['Asset backed', 'Visible cash flows'],
        concerns: ['Working capital intensive', 'Cyclical demand'],
        outlook: 'STABLE'
      },
      'RETAIL': {
        riskLevel: 'MEDIUM',
        factors: ['Consumer facing', 'Cash business'],
        concerns: ['Competition', 'Low margins', 'Inventory risk'],
        outlook: 'CAUTIOUS'
      },
      'HEALTHCARE': {
        riskLevel: 'LOW',
        factors: ['Essential service', 'Recurring revenue'],
        concerns: ['Regulatory changes', 'Reimbursement delays'],
        outlook: 'POSITIVE'
      },
      'REAL_ESTATE': {
        riskLevel: 'HIGH',
        factors: ['Asset backed'],
        concerns: ['Liquidity risk', 'Regulatory issues', 'Market cycles'],
        outlook: 'NEGATIVE'
      },
      'AGRICULTURE': {
        riskLevel: 'HIGH',
        factors: ['Essential sector'],
        concerns: ['Monsoon dependency', 'Price volatility', 'Perishable goods'],
        outlook: 'CAUTIOUS'
      },
      'LOGISTICS': {
        riskLevel: 'MEDIUM',
        factors: ['Growing demand', 'Essential service'],
        concerns: ['Fuel costs', 'Competition', 'Asset heavy'],
        outlook: 'STABLE'
      }
    };

    const risk = sectorRisks[sector] || {
      riskLevel: 'MEDIUM',
      factors: [],
      concerns: ['Sector specific analysis required'],
      outlook: 'NEUTRAL'
    };

    res.json({
      success: true,
      data: {
        sector,
        ...risk
      }
    });
  } catch (error) {
    logger.error('Error fetching sector risk:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch sector risk' }
    });
  }
});

// POST /risk/litigation-impact - Litigation risk assessment
router.post('/litigation-impact', authenticateToken, [
  body('applicationId').isString().notEmpty()
], async (req, res) => {
  try {
    const { applicationId } = req.body;
    const prisma = getPrismaClient();

    const litigations = await prisma.litigation.findMany({
      where: { applicationId }
    });

    const impact = assessLitigationImpact(litigations);

    res.json({
      success: true,
      data: impact
    });
  } catch (error) {
    logger.error('Error assessing litigation impact:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to assess litigation impact' }
    });
  }
});

// Helper functions
function analyzeFinancialRisk(extractions) {
  const financialExtraction = extractions.find(e => e.documentType === 'BALANCE_SHEET');
  const financials = financialExtraction?.extractedData?.financials || {};

  const risks = [];
  let score = 70;

  if (financials.debtToEquity && financials.debtToEquity > 3) {
    risks.push({ type: 'HIGH_LEVERAGE', severity: 'HIGH', details: `D/E ratio: ${financials.debtToEquity.toFixed(2)}` });
    score -= 15;
  }

  if (financials.currentRatio && financials.currentRatio < 1) {
    risks.push({ type: 'LIQUIDITY_RISK', severity: 'HIGH', details: `Current ratio: ${financials.currentRatio.toFixed(2)}` });
    score -= 15;
  }

  if (financials.netProfit && financials.netProfit < 0) {
    risks.push({ type: 'LOSS_MAKING', severity: 'HIGH', details: 'Negative profitability' });
    score -= 20;
  }

  return { score: Math.max(0, score), risks };
}

async function analyzeGSTRisk(extractions) {
  const gstExtraction = extractions.find(e => e.documentType === 'GST_RETURN_1');
  const bankExtraction = extractions.find(e => e.documentType === 'BANK_STATEMENT');

  if (!gstExtraction || !bankExtraction) {
    return { score: 50, risks: [{ type: 'DATA_INSUFFICIENT', severity: 'MEDIUM' }] };
  }

  const gstTurnover = gstExtraction.extractedData?.gstData?.totalTaxableValue || 0;
  const bankCredits = bankExtraction.extractedData?.bankData?.totalCredits || 0;
  const variance = gstTurnover > 0 ? Math.abs(gstTurnover - bankCredits) / gstTurnover : 0;

  const risks = [];
  let score = 70;

  if (variance > 0.3) {
    risks.push({ type: 'GST_BANK_MISMATCH', severity: 'HIGH', details: `${(variance * 100).toFixed(1)}% variance` });
    score -= 20;
  } else if (variance > 0.2) {
    risks.push({ type: 'GST_BANK_MISMATCH', severity: 'MEDIUM', details: `${(variance * 100).toFixed(1)}% variance` });
    score -= 10;
  }

  return { score: Math.max(0, score), risks, variance };
}

async function analyzeCircularTrading(applicationId, CircularTrading) {
  try {
    // First check if analysis already exists
    const existing = await CircularTrading.findOne({ applicationId });

    if (existing) {
      return {
        score: existing.score || (existing.riskLevel === 'HIGH' ? 30 : existing.riskLevel === 'MEDIUM' ? 50 : 70),
        detected: existing.detected !== false,
        riskLevel: existing.riskLevel || 'LOW',
        circularPercentage: existing.circularPercentage || 0,
        suspiciousSuppliers: existing.suspiciousSuppliers?.length || 0,
        recommendation: existing.recommendation || 'Standard verification sufficient'
      };
    }

    // No data available yet
    return {
      score: 85,
      detected: false,
      riskLevel: 'LOW',
      circularPercentage: 0,
      suspiciousSuppliers: 0,
      recommendation: 'Awaiting data for analysis'
    };
  } catch (error) {
    logger.error('Error analyzing circular trading:', error);
    return {
      score: 50,
      detected: false,
      riskLevel: 'UNKNOWN',
      circularPercentage: 0,
      suspiciousSuppliers: 0
    };
  }
}

function analyzeLitigationRisk(litigations) {
  const risks = [];
  let score = 80;

  const activeLitigations = litigations.filter(l => l.status === 'ACTIVE');
  const criticalLitigations = activeLitigations.filter(l => ['CRITICAL', 'HIGH'].includes(l.severity));

  if (criticalLitigations.length > 0) {
    risks.push({ type: 'CRITICAL_LITIGATION', severity: 'CRITICAL', count: criticalLitigations.length });
    score -= 30;
  }

  if (activeLitigations.length > criticalLitigations.length) {
    risks.push({ type: 'ACTIVE_LITIGATION', severity: 'HIGH', count: activeLitigations.length });
    score -= 15;
  }

  const totalClaimAmount = litigations.reduce((sum, l) => sum + (l.claimAmount || 0), 0);

  return {
    score: Math.max(0, score),
    risks,
    totalCases: litigations.length,
    activeCases: activeLitigations.length,
    totalClaimAmount
  };
}

function analyzeReputationRisk(intelligence) {
  const risks = [];
  let score = 80;

  const negativeNews = intelligence.filter(i => i.sentiment?.category === 'NEGATIVE');
  const criticalNews = intelligence.filter(i => i.riskImpact === 'CRITICAL');

  if (criticalNews.length > 0) {
    risks.push({ type: 'CRITICAL_NEWS', severity: 'HIGH', count: criticalNews.length });
    score -= 20;
  }

  if (negativeNews.length > 3) {
    risks.push({ type: 'NEGATIVE_SENTIMENT', severity: 'MEDIUM', count: negativeNews.length });
    score -= 10;
  }

  return { score: Math.max(0, score), risks };
}

function analyzeSectorRisk(sector) {
  const sectorScores = {
    'IT_SERVICES': 85,
    'HEALTHCARE': 80,
    'MANUFACTURING': 70,
    'LOGISTICS': 70,
    'RETAIL': 65,
    'AGRICULTURE': 55,
    'REAL_ESTATE': 50
  };

  return {
    score: sectorScores[sector] || 70,
    sector,
    outlook: sectorScores[sector] >= 75 ? 'POSITIVE' : sectorScores[sector] >= 60 ? 'STABLE' : 'CAUTIOUS'
  };
}

function calculateOverallRiskScore(analyses) {
  const weights = {
    financial: 0.30,
    gstReconciliation: 0.15,
    circularTrading: 0.15,
    litigation: 0.25,
    reputation: 0.15
  };

  let totalScore = 0;
  let totalWeight = 0;

  Object.entries(weights).forEach(([key, weight]) => {
    if (analyses[key]?.score !== undefined) {
      totalScore += analyses[key].score * weight;
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? totalScore / totalWeight : 50;
}

function getRiskLevel(score) {
  if (score >= 70) return 'LOW';
  if (score >= 50) return 'MEDIUM';
  if (score >= 30) return 'HIGH';
  return 'CRITICAL';
}

function generateRecommendations(analyses) {
  const recommendations = [];

  if (analyses.financial?.score < 60) {
    recommendations.push('Conduct detailed financial due diligence');
  }

  if (analyses.litigation?.activeCases > 0) {
    recommendations.push('Obtain legal opinion on active litigations');
  }

  if (analyses.circularTrading?.detected) {
    recommendations.push('Investigate supplier relationships for circular trading patterns');
  }

  if (analyses.gstReconciliation?.risks?.length > 0) {
    recommendations.push('Request explanation for GST-Bank turnover variance');
  }

  return recommendations;
}

function getRiskStatus(extractions, type) {
  const flags = extractions.flatMap(e => e.riskFlags || []);
  const highFlags = flags.filter(f => f.severity === 'HIGH').length;
  return highFlags > 2 ? 'high' : highFlags > 0 ? 'moderate' : 'low';
}

function extractKeyRisks(extractions, litigations, circularTrading, intelligence) {
  const risks = [];

  // Add litigation risks
  if (litigations?.length > 0) {
    risks.push({
      category: 'Legal',
      description: `${litigations.length} litigation case(s) found`,
      severity: litigations.some(l => l.severity === 'CRITICAL') ? 'HIGH' : 'MEDIUM'
    });
  }

  // Add circular trading
  if (circularTrading?.detected) {
    risks.push({
      category: 'Operational',
      description: 'Circular trading patterns detected',
      severity: circularTrading.riskLevel
    });
  }

  // Add document flags
  const docFlags = extractions.flatMap(e => e.riskFlags?.filter(f => f.severity === 'HIGH') || []);
  docFlags.slice(0, 3).forEach(flag => {
    risks.push({
      category: 'Financial',
      description: flag.description,
      severity: flag.severity
    });
  });

  return risks;
}

function extractMitigatingFactors(score) {
  if (!score) return [];

  const factors = [];
  if (score.positiveFactors) {
    factors.push(...score.positiveFactors.slice(0, 3).map(f => f.factor));
  }
  return factors;
}

async function detectCircularTrading(applicationId, gstExtractions) {
  try {
    // Get supplier data from GST extractions
    const supplierData = gstExtractions.map(ext => ({
      gstin: ext.gstin,
      name: ext.name,
      suppliers: ext.suppliers || []
    }));

    // Use the circular trading service for analysis
    const result = await circularTradingService.detectCircularTrading(
      applicationId,
      gstExtractions,
      supplierData
    );

    return result;
  } catch (error) {
    logger.error('Error detecting circular trading:', error);
    return {
      detected: false,
      riskLevel: 'LOW',
      suspiciousSuppliers: [],
      circularPercentage: 0,
      score: 85
    };
  }
}

function assessLitigationImpact(litigations) {
  const activeCases = litigations.filter(l => l.status === 'ACTIVE');
  const totalClaim = litigations.reduce((sum, l) => sum + (l.claimAmount || 0), 0);

  return {
    totalCases: litigations.length,
    activeCases: activeCases.length,
    totalClaimAmount: totalClaim,
    riskScore: activeCases.length > 3 ? 20 : activeCases.length > 0 ? 50 : 80,
    impact: activeCases.length > 3 ? 'HIGH' : activeCases.length > 0 ? 'MEDIUM' : 'LOW',
    recommendation: activeCases.length > 3 ? 'Detailed legal review required' :
      activeCases.length > 0 ? 'Monitor litigation progress' : 'No significant litigation risk'
  };
}

module.exports = router;