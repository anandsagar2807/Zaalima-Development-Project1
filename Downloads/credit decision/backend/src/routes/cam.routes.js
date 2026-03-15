const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth.middleware');
const { getPrismaClient, getMongoModels } = require('../config/database');
const { withTransaction, canTransitionStatus } = require('../utils/validators');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// POST /cam/generate/:appId - Generate CAM
router.post('/generate/:appId', authenticateToken, [
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
    const { Explanation, SiteVisit } = getMongoModels();

    const application = await prisma.application.findUnique({
      where: { id: req.params.appId },
      include: {
        company: true,
        documents: true,
        scores: { orderBy: { calculatedAt: 'desc' }, take: 1 },
        primaryInput: true,
        litigationRecords: true
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found' }
      });
    }

    const latestScore = application.scores[0];
    const explanation = latestScore ? await Explanation.findOne({
      applicationId: req.params.appId,
      scoreId: latestScore.id
    }) : null;

    const siteVisits = await SiteVisit.find({ applicationId: req.params.appId });

    // Generate CAM content
    const camContent = generateCAMContent(application, latestScore, explanation, siteVisits);

    // Check if CAM exists
    const existingCAM = await prisma.cAM.findUnique({
      where: { applicationId: req.params.appId }
    });

    let cam;
    if (existingCAM) {
      cam = await prisma.cAM.update({
        where: { applicationId: req.params.appId },
        data: {
          executiveSummary: camContent.executiveSummary,
          industryAnalysis: camContent.industryAnalysis,
          financialAnalysis: camContent.financialAnalysis,
          riskAssessment: camContent.riskAssessment,
          recommendation: camContent.recommendation,
          version: incrementVersion(existingCAM.version),
          status: 'DRAFT'
        }
      });
    } else {
      cam = await prisma.cAM.create({
        data: {
          id: uuidv4(),
          applicationId: req.params.appId,
          executiveSummary: camContent.executiveSummary,
          industryAnalysis: camContent.industryAnalysis,
          financialAnalysis: camContent.financialAnalysis,
          riskAssessment: camContent.riskAssessment,
          recommendation: camContent.recommendation,
          version: '1.0',
          status: 'DRAFT'
        }
      });
    }

    logger.info(`CAM generated for application: ${req.params.appId}`);

    res.json({
      success: true,
      data: cam
    });
  } catch (error) {
    logger.error('Error generating CAM:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate CAM' }
    });
  }
});

// GET /cam/:appId - Get CAM data
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

    const cam = await prisma.cAM.findUnique({
      where: { applicationId: req.params.appId },
      include: { application: { include: { company: true } } }
    });

    if (!cam) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'CAM not found' }
      });
    }

    res.json({
      success: true,
      data: cam
    });
  } catch (error) {
    logger.error('Error fetching CAM:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch CAM' }
    });
  }
});

// PUT /cam/:appId - Update CAM content
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
    const { executiveSummary, industryAnalysis, financialAnalysis, riskAssessment, recommendation } = req.body;

    const cam = await prisma.cAM.update({
      where: { applicationId: req.params.appId },
      data: {
        executiveSummary,
        industryAnalysis,
        financialAnalysis,
        riskAssessment,
        recommendation
      }
    });

    res.json({
      success: true,
      data: cam
    });
  } catch (error) {
    logger.error('Error updating CAM:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update CAM' }
    });
  }
});

// POST /cam/:appId/approve - Approve CAM
router.post('/:appId/approve', authenticateToken, [
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
    const appId = req.params.appId;

    // Get current application to check status
    const application = await prisma.application.findUnique({
      where: { id: appId },
      select: { status: true }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found' }
      });
    }

    // Validate status transition
    if (!canTransitionStatus(application.status, 'APPROVED')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TRANSITION',
          message: `Cannot transition from ${application.status} to APPROVED`
        }
      });
    }

    // Use transaction to ensure atomic updates
    const result = await withTransaction(prisma, async (tx) => {
      // Update CAM
      const cam = await tx.cAM.update({
        where: { applicationId: appId },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          approvedBy: req.user.userId
        }
      });

      // Update application
      const updatedApp = await tx.application.update({
        where: { id: appId },
        data: {
          status: 'APPROVED',
          decisionDate: new Date()
        }
      });

      return { cam, application: updatedApp };
    });

    logger.info(`CAM approved for application: ${appId} by user ${req.user.userId}`);

    res.json({
      success: true,
      data: result.cam
    });
  } catch (error) {
    logger.error('Error approving CAM:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to approve CAM' }
    });
  }
});

// POST /cam/:appId/reject - Reject CAM
router.post('/:appId/reject', authenticateToken, [
  param('appId').isString().notEmpty(),
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
    const appId = req.params.appId;
    const { reason } = req.body;

    // Get current application to check status
    const application = await prisma.application.findUnique({
      where: { id: appId },
      select: { status: true }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found' }
      });
    }

    // Validate status transition
    if (!canTransitionStatus(application.status, 'REJECTED')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TRANSITION',
          message: `Cannot transition from ${application.status} to REJECTED`
        }
      });
    }

    // Use transaction to ensure atomic updates
    const result = await withTransaction(prisma, async (tx) => {
      // Update CAM
      const cam = await tx.cAM.update({
        where: { applicationId: appId },
        data: {
          status: 'REJECTED',
          rejectedAt: new Date(),
          rejectionReason: reason || 'Rejected by approval authority'
        }
      });

      // Update application
      const updatedApp = await tx.application.update({
        where: { id: appId },
        data: {
          status: 'REJECTED',
          decisionDate: new Date(),
          rejectionReason: reason
        }
      });

      return { cam, application: updatedApp };
    });

    logger.info(`CAM rejected for application: ${appId} by user ${req.user.userId}`);

    res.json({
      success: true,
      data: result.cam
    });
  } catch (error) {
    logger.error('Error rejecting CAM:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to reject CAM' }
    });
  }
});

// GET /cam/:appId/pdf - Download PDF
router.get('/:appId/pdf', authenticateToken, async (req, res) => {
  try {
    const prisma = getPrismaClient();

    const cam = await prisma.cAM.findUnique({
      where: { applicationId: req.params.appId },
      include: { application: { include: { company: true } } }
    });

    if (!cam) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'CAM not found' }
      });
    }

    // Generate PDF content (placeholder - would use PDF library in production)
    const pdfContent = generatePDFContent(cam);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="CAM-${cam.application.applicationNumber}.pdf"`);
    res.send(pdfContent);
  } catch (error) {
    logger.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate PDF' }
    });
  }
});

// GET /cam/:appId/preview - Preview HTML
router.get('/:appId/preview', authenticateToken, async (req, res) => {
  try {
    const prisma = getPrismaClient();

    const cam = await prisma.cAM.findUnique({
      where: { applicationId: req.params.appId },
      include: { application: { include: { company: true } } }
    });

    if (!cam) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'CAM not found' }
      });
    }

    const html = generateHTMLPreview(cam);

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    logger.error('Error generating preview:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate preview' }
    });
  }
});

// Helper functions
function generateCAMContent(application, score, explanation, siteVisits) {
  const company = application.company;
  const scoreData = score || {};
  const positiveFactors = scoreData.positiveFactors || [];
  const negativeFactors = scoreData.negativeFactors || [];

  return {
    executiveSummary: `
CREDIT APPRAISAL MEMORANDUM

Application Number: ${application.applicationNumber}
Company Name: ${company?.name || 'N/A'}
Date: ${new Date().toLocaleDateString()}

LOAN PARTICULARS:
- Loan Amount: ₹${application.loanAmount?.toLocaleString() || 'N/A'}
- Tenor: ${application.tenorMonths || 'N/A'} months
- Purpose: ${application.purpose || 'N/A'}

CREDIT ASSESSMENT SUMMARY:
- Risk Score: ${scoreData.totalScore?.toFixed(1) || 'N/A'}
- Risk Grade: ${scoreData.riskGrade || 'N/A'}
- Recommended Amount: ₹${application.recommendedAmount?.toLocaleString() || application.loanAmount?.toLocaleString() || 'N/A'}
    `.trim(),

    industryAnalysis: `
INDUSTRY ANALYSIS

Sector: ${company?.sector || 'N/A'}
Business Type: ${company?.businessType || 'N/A'}
Company Scale: ${company?.scale || 'N/A'}

Industry Overview:
The company operates in the ${company?.sector || 'specified'} sector. Industry conditions have been 
considered in the overall risk assessment.

Market Position:
- Company vintage: ${company?.incorporationDate ? Math.floor((new Date() - new Date(company.incorporationDate)) / (1000 * 60 * 60 * 24 * 365)) + ' years' : 'N/A'}
- Business status: ${company?.status || 'Active'}
    `.trim(),

    financialAnalysis: `
FINANCIAL ANALYSIS

FIVE Cs ASSESSMENT:

1. CHARACTER (Weight: 20%)
   Score: ${scoreData.characterScore?.toFixed(1) || 'N/A'}/100
   ${positiveFactors.filter(f => f.factor?.toLowerCase().includes('management') || f.factor?.toLowerCase().includes('credit')).map(f => `✓ ${f.factor}: ${f.details}`).join('\n   ') || 'Assessment based on track record and management quality'}

2. CAPACITY (Weight: 25%)
   Score: ${scoreData.capacityScore?.toFixed(1) || 'N/A'}/100
   Financial Ratio Score: ${scoreData.financialRatioScore || 'N/A'}
   GST Analysis Score: ${scoreData.gstAnalysisScore || 'N/A'}
   Bank Statement Score: ${scoreData.bankStatementScore || 'N/A'}

3. CAPITAL (Weight: 20%)
   Score: ${scoreData.capitalScore?.toFixed(1) || 'N/A'}/100
   Assessment based on net worth and leverage position.

4. COLLATERAL (Weight: 15%)
   Score: ${scoreData.collateralScore?.toFixed(1) || 'N/A'}/100
   Assessment based on security coverage and asset quality.

5. CONDITIONS (Weight: 20%)
   Score: ${scoreData.conditionsScore?.toFixed(1) || 'N/A'}/100
   Sector risk impact: ${scoreData.sectorRiskImpact || 'N/A'}
    `.trim(),

    riskAssessment: `
RISK ASSESSMENT

STRENGTHS:
${positiveFactors.slice(0, 5).map(f => `• ${f.factor}: ${f.details} (Impact: +${f.impact})`).join('\n') || '• Standard credit profile'}

WEAKNESSES/CONCERNS:
${negativeFactors.slice(0, 5).map(f => `• ${f.factor}: ${f.details} (Impact: ${f.impact})`).join('\n') || '• No significant concerns identified'}

RISK MITIGANTS:
${explanation?.recommendationLogic?.mitigants?.map(m => `• ${m}`).join('\n') || '• Standard monitoring recommended'}

LITIGATION SUMMARY:
- Total Cases: ${application.litigationRecords?.length || 0}
- Active Cases: ${application.litigationRecords?.filter(l => l.status === 'ACTIVE')?.length || 0}
    `.trim(),

    recommendation: `
RECOMMENDATION

Based on the comprehensive credit assessment:

DECISION: ${explanation?.recommendationLogic?.decision || getRecommendation(scoreData.totalScore)}
CONFIDENCE LEVEL: ${explanation?.recommendationLogic?.confidence || 70}%

RECOMMENDED EXPOSURE: ₹${application.recommendedAmount?.toLocaleString() || application.loanAmount?.toLocaleString() || 'As per assessment'}

KEY CONDITIONS:
1. Quarterly financial monitoring
2. Periodic site visits
3. Covenant compliance tracking
4. Early warning indicator monitoring

APPROVAL AUTHORITY:
As per delegation of authority based on exposure amount.

Prepared by: Credit Decision Engine
Date: ${new Date().toLocaleDateString()}
    `.trim()
  };
}

function getRecommendation(score) {
  if (!score) return 'REVIEW_REQUIRED';
  if (score >= 65) return 'APPROVE';
  if (score >= 55) return 'APPROVE_WITH_CONDITIONS';
  if (score >= 45) return 'REVIEW_REQUIRED';
  return 'REJECT';
}

function incrementVersion(version) {
  const parts = version.split('.');
  parts[1] = (parseInt(parts[1] || 0) + 1).toString();
  return parts.join('.');
}

function generatePDFContent(cam) {
  try {
    // Create a more structured PDF content
    // In production, you would use puppeteer or pdfkit to generate actual PDF
    const text = `
================================================================================
                    CREDIT APPRAISAL MEMORANDUM
================================================================================

APPLICATION DETAILS
Application Number: ${cam.application?.applicationNumber || 'N/A'}
Company: ${cam.application?.company?.name || 'N/A'}
Sector: ${cam.application?.company?.sector || 'N/A'}
Generated Date: ${new Date().toLocaleDateString()}

================================================================================
EXECUTIVE SUMMARY
================================================================================
${cam.executiveSummary || 'No summary available'}

================================================================================
INDUSTRY ANALYSIS
================================================================================
${cam.industryAnalysis || 'No analysis available'}

================================================================================
FINANCIAL ANALYSIS
================================================================================
${cam.financialAnalysis || 'No analysis available'}

================================================================================
RISK ASSESSMENT
================================================================================
${cam.riskAssessment || 'No assessment available'}

================================================================================
RECOMMENDATION
================================================================================
${cam.recommendation || 'No recommendation available'}

================================================================================
Document Status: ${cam.status}
Version: ${cam.version || '1.0'}
CAM ID: ${cam.id}
================================================================================
`;

    // For now, returning Buffer with text content
    // In production: use puppeteer/pdfkit to generate actual PDF
    return Buffer.from(text, 'utf-8');
  } catch (error) {
    logger.error('Error generating PDF content:', error);
    throw error;
  }
}

function generateHTMLPreview(cam) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>CAM Preview - ${cam.application.applicationNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
    h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
    h2 { color: #374151; margin-top: 30px; }
    .section { margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 8px; }
    .header { text-align: center; margin-bottom: 30px; }
    .grade { font-size: 24px; font-weight: bold; color: ${cam.application.riskGrade?.startsWith('A') ? '#059669' : cam.application.riskGrade?.startsWith('B') ? '#2563eb' : '#dc2626'}; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Credit Appraisal Memorandum</h1>
    <p>${cam.application.applicationNumber}</p>
  </div>
  
  <div class="section">
    <h2>Executive Summary</h2>
    <pre style="white-space: pre-wrap;">${cam.executiveSummary}</pre>
  </div>
  
  <div class="section">
    <h2>Industry Analysis</h2>
    <pre style="white-space: pre-wrap;">${cam.industryAnalysis}</pre>
  </div>
  
  <div class="section">
    <h2>Financial Analysis</h2>
    <pre style="white-space: pre-wrap;">${cam.financialAnalysis}</pre>
  </div>
  
  <div class="section">
    <h2>Risk Assessment</h2>
    <pre style="white-space: pre-wrap;">${cam.riskAssessment}</pre>
  </div>
  
  <div class="section">
    <h2>Recommendation</h2>
    <pre style="white-space: pre-wrap;">${cam.recommendation}</pre>
  </div>
</body>
</html>
  `;
}

module.exports = router;