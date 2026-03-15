const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth.middleware');
const { getPrismaClient, getMongoModels } = require('../config/database');
const researchService = require('../services/researchService');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// POST /research/initiate/:appId - Start automated research
router.post('/initiate/:appId', authenticateToken, [
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
    const { Intelligence } = getMongoModels();

    const application = await prisma.application.findUnique({
      where: { id: req.params.appId },
      include: { company: true }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found' }
      });
    }

    // Perform comprehensive research using the service
    const mcaResult = await researchService.performMCAResearch(
      application.companyId,
      application.company.name,
      application.company.cin,
      application.company.gstin
    );

    const newsResult = await researchService.performNewsResearch(
      application.companyId,
      application.company.name
    );

    const litigationResult = await researchService.performLitigationResearch(
      application.companyId,
      application.company.name
    );

    const complianceResult = await researchService.performComplianceResearch(
      application.companyId,
      application.company.name
    );

    const researchResults = [mcaResult, newsResult, litigationResult, complianceResult];

    // Compile intelligence
    const intelligence = await researchService.compileIntelligence(
      application.companyId,
      application.company,
      researchResults
    );

    // Save to MongoDB
    const intelligenceRecord = new Intelligence({
      _id: uuidv4(),
      applicationId: req.params.appId,
      companyId: application.companyId,
      title: 'Comprehensive Company Intelligence',
      content: JSON.stringify(intelligence),
      sentiment: intelligence.overallRiskAssessment,
      riskImpact: intelligence.summary.worstRiskImpact,
      riskCategories: intelligence.topRisks.map(r => r.indicator),
      researchDate: new Date(),
      sources: intelligence.sources
    });

    await intelligenceRecord.save();

    // Save research data to PostgreSQL
    for (const result of researchResults) {
      await prisma.researchData.create({
        data: {
          id: uuidv4(),
          applicationId: req.params.appId,
          companyId: application.companyId,
          sourceType: result.source,
          content: JSON.stringify(result),
          riskImpact: result.riskImpact,
          researchDate: new Date()
        }
      });
    }

    logger.info(`Research completed for application: ${req.params.appId}`);

    res.json({
      success: true,
      data: {
        message: 'Research completed',
        intelligence: intelligence,
        results: researchResults.length
      }
    });
  } catch (error) {
    logger.error('Error initiating research:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to initiate research' }
    });
  }
});

// GET /research/status/:appId - Research status
router.get('/status/:appId', authenticateToken, async (req, res) => {
  try {
    const prisma = getPrismaClient();

    const researchData = await prisma.researchData.findMany({
      where: { applicationId: req.params.appId }
    });

    const status = {
      total: researchData.length,
      sources: researchData.map(r => r.sourceType),
      lastUpdated: researchData.length > 0
        ? Math.max(...researchData.map(r => r.createdAt))
        : null
    };

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Error fetching research status:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch research status' }
    });
  }
});

// GET /research/results/:appId - Research findings
router.get('/results/:appId', authenticateToken, async (req, res) => {
  try {
    const { Intelligence } = getMongoModels();

    const results = await Intelligence.find({ applicationId: req.params.appId });

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    logger.error('Error fetching research results:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch research results' }
    });
  }
});

// GET /research/litigation/:appId - Litigation tracking
router.get('/litigation/:appId', authenticateToken, async (req, res) => {
  try {
    const prisma = getPrismaClient();
    const { Intelligence } = getMongoModels();

    const litigations = await prisma.litigation.findMany({
      where: { applicationId: req.params.appId }
    });

    const courtData = await Intelligence.find({
      applicationId: req.params.appId,
      source: 'E_COURTS'
    });

    res.json({
      success: true,
      data: {
        litigations,
        courtData,
        summary: {
          total: litigations.length,
          active: litigations.filter(l => l.status === 'ACTIVE').length,
          critical: litigations.filter(l => l.severity === 'CRITICAL' || l.severity === 'HIGH').length
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching litigation data:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch litigation data' }
    });
  }
});

// GET /research/mca/:companyId - MCA filings
router.get('/mca/:companyId', authenticateToken, async (req, res) => {
  try {
    const { Intelligence } = getMongoModels();

    const mcaData = await Intelligence.find({
      companyId: req.params.companyId,
      source: 'MCA'
    });

    res.json({
      success: true,
      data: mcaData
    });
  } catch (error) {
    logger.error('Error fetching MCA data:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch MCA data' }
    });
  }
});

// GET /research/news/:companyId - News sentiment
router.get('/news/:companyId', authenticateToken, async (req, res) => {
  try {
    const { Intelligence } = getMongoModels();

    const newsData = await Intelligence.find({
      companyId: req.params.companyId,
      source: 'NEWS'
    }).sort({ publishedDate: -1 });

    const sentimentSummary = {
      positive: newsData.filter(n => n.sentiment?.category === 'POSITIVE').length,
      negative: newsData.filter(n => n.sentiment?.category === 'NEGATIVE').length,
      neutral: newsData.filter(n => n.sentiment?.category === 'NEUTRAL').length
    };

    res.json({
      success: true,
      data: {
        news: newsData,
        sentimentSummary
      }
    });
  } catch (error) {
    logger.error('Error fetching news data:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch news data' }
    });
  }
});

module.exports = router;