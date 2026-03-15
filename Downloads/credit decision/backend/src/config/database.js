const { PrismaClient } = require('@prisma/client');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

let prisma;
let mongoConnection;

// PostgreSQL connection via Prisma
const connectPostgreSQL = async () => {
  try {
    prisma = new PrismaClient();
    await prisma.$connect();
    logger.info('✅ PostgreSQL connected successfully via Prisma');
    return prisma;
  } catch (error) {
    logger.error('❌ PostgreSQL connection failed:', error);
    throw error;
  }
};

// MongoDB connection via Mongoose
const connectMongoDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/credit_decision';
    
    mongoConnection = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    mongoose.connection.on('connected', () => {
      logger.info('✅ MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected');
    });

    // Initialize MongoDB schemas
    initializeMongoSchemas();

    return mongoConnection;
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    throw error;
  }
};

// Initialize MongoDB schemas
const initializeMongoSchemas = () => {
  // Extraction Schema
  const extractionSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    applicationId: { type: String, required: true, index: true },
    companyId: { type: String, required: true, index: true },
    documentType: {
      type: String,
      enum: ['GST_RETURN_1', 'GST_RETURN_3B', 'GST_2A', 'ITR', 'BANK_STATEMENT',
             'BALANCE_SHEET', 'PNL_STATEMENT', 'ANNUAL_REPORT', 'BOARD_RESOLUTION',
             'CIBIL_REPORT', 'MOA_AOA', 'RATING_REPORT', 'SHAREHOLDING_PATTERN'],
      required: true
    },
    rawText: String,
    confidenceScore: Number,
    extractedData: {
      financials: {
        turnover: Number,
        grossProfit: Number,
        netProfit: Number,
        totalAssets: Number,
        totalLiabilities: Number,
        netWorth: Number,
        currentRatio: Number,
        debtToEquity: Number
      },
      gstData: {
        supplierList: [{
          gstin: String,
          name: String,
          totalValue: Number,
          taxPaid: Number
        }],
        totalTaxableValue: Number,
        igst: Number,
        cgst: Number,
        sgst: Number,
        filingPeriod: Date
      },
      itrData: {
        assessmentYear: String,
        grossTotalIncome: Number,
        totalTaxPaid: Number,
        refundClaimed: Number,
        tdsCredits: Number
      },
      bankData: {
        accountNumber: String,
        averageBalance: Number,
        totalCredits: Number,
        totalDebits: Number,
        bounceCount: Number,
        highValueTransactions: [{
          date: Date,
          amount: Number,
          type: String,
          narration: String
        }]
      },
      cibilData: {
        score: Number,
        defaultAccounts: Number,
        currentDpd: Number,
        worstDpd: Number,
        totalExposure: Number,
        facilities: [{
          type: String,
          lender: String,
          sanctionedAmount: Number,
          currentBalance: Number,
          overdue: Number
        }]
      }
    },
    nlpAnalysis: {
      commitments: [{
        type: String,
        amount: Number,
        beneficiary: String,
        endDate: Date
      }],
      contingentLiabilities: [{
        description: String,
        estimatedAmount: Number,
        probability: String
      }],
      disputes: [{
        type: String,
        party: String,
        amount: Number,
        status: String
      }],
      relatedPartyTransactions: [{
        partyName: String,
        nature: String,
        amount: Number
      }]
    },
    riskFlags: [{
      type: String,
      severity: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'] },
      description: String,
      supportingText: String
    }],
    processingTime: Number,
    extractionVersion: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });

  // Intelligence Schema (Web Scraped Data)
  const intelligenceSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    applicationId: { type: String, required: true, index: true },
    companyId: { type: String, required: true, index: true },
    source: {
      type: String,
      enum: ['MCA', 'E_COURTS', 'NEWS', 'RBI', 'RATING_AGENCY', 'SOCIAL_MEDIA'],
      required: true
    },
    url: String,
    title: String,
    content: String,
    publishedDate: Date,
    sentiment: {
      polarity: Number,
      category: { type: String, enum: ['POSITIVE', 'NEGATIVE', 'NEUTRAL'] },
      confidence: Number
    },
    entities: [{
      name: String,
      type: String,
      relevanceScore: Number
    }],
    riskImpact: {
      type: String,
      enum: ['POSITIVE', 'NEUTRAL', 'LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK', 'CRITICAL']
    },
    riskCategories: [String],
    scrapedAt: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now }
  });

  // Circular Trading Detection Schema
  const circularTradingSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    applicationId: { type: String, required: true, index: true },
    companyId: { type: String, required: true, index: true },
    suspiciousSuppliers: [{
      gstin: String,
      name: String,
      transactionValue: Number,
      circularityScore: Number,
      reasons: [String]
    }],
    tradeNetwork: {
      nodes: [{
        gstin: String,
        name: String,
        type: { type: String, enum: ['COMPANY', 'SUPPLIER', 'CUSTOMER'] }
      }],
      edges: [{
        from: String,
        to: String,
        value: Number,
        transactionCount: Number
      }]
    },
    circularTurnover: Number,
    percentageOfTotal: Number,
    riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
    detectedAt: { type: Date, default: Date.now }
  });

  // Score Explanation Schema
  const explanationSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    applicationId: { type: String, required: true, index: true },
    scoreId: { type: String, required: true },
    scoreBreakdown: {
      fiveCs: {
        character: {
          baseScore: Number,
          contributingFactors: [{ factor: String, impact: Number, details: String }]
        },
        capacity: {
          baseScore: Number,
          contributingFactors: [{ factor: String, impact: Number, details: String }]
        },
        capital: {
          baseScore: Number,
          contributingFactors: [{ factor: String, impact: Number, details: String }]
        },
        collateral: {
          baseScore: Number,
          contributingFactors: [{ factor: String, impact: Number, details: String }]
        },
        conditions: {
          baseScore: Number,
          contributingFactors: [{ factor: String, impact: Number, details: String }]
        }
      },
      financialMetrics: [{
        metric: String,
        value: Number,
        benchmark: Number,
        performance: { type: String, enum: ['GOOD', 'AVERAGE', 'POOR'] },
        impact: Number
      }],
      riskAdjustments: [{
        type: String,
        description: String,
        impact: Number,
        severity: String
      }]
    },
    sensitivityAnalysis: [{
      variable: String,
      currentValue: Number,
      sensitivity: Number,
      impactExplanation: String
    }],
    recommendationLogic: {
      decision: String,
      confidence: Number,
      keyDrivers: [String],
      risks: [String],
      mitigants: [String]
    },
    createdAt: { type: Date, default: Date.now }
  });

  // Site Visit Schema
  const siteVisitSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    applicationId: { type: String, required: true, index: true },
    visitType: { type: String, enum: ['INITIAL', 'FOLLOW_UP', 'VERIFICATION'], default: 'INITIAL' },
    scheduledDate: Date,
    conductedDate: Date,
    visitedBy: String,
    status: { type: String, enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'], default: 'SCHEDULED' },
    location: {
      address: String,
      city: String,
      state: String,
      coordinates: { lat: Number, lng: Number }
    },
    observations: {
      infrastructure: { type: Number, min: 1, max: 10 },
      operations: { type: Number, min: 1, max: 10 },
      housekeeping: { type: Number, min: 1, max: 10 },
      safetyCompliance: { type: Number, min: 1, max: 10 },
      overallImpression: { type: Number, min: 1, max: 10 },
      notes: String
    },
    photos: [{
      url: String,
      caption: String,
      category: { type: String, enum: ['FACILITY', 'EQUIPMENT', 'INVENTORY', 'DOCUMENTS', 'OTHER'] }
    }],
    keyFindings: [String],
    followUpActions: [{
      action: String,
      priority: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'] },
      dueDate: Date,
      status: { type: String, enum: ['PENDING', 'COMPLETED'], default: 'PENDING' }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });

  // Register models
  mongoose.models = {};
  
  mongoose.model('Extraction', extractionSchema);
  mongoose.model('Intelligence', intelligenceSchema);
  mongoose.model('CircularTrading', circularTradingSchema);
  mongoose.model('Explanation', explanationSchema);
  mongoose.model('SiteVisit', siteVisitSchema);

  logger.info('📦 MongoDB schemas initialized');
};

// Get Prisma client
const getPrismaClient = () => {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
};

// Get Mongoose models
const getMongoModels = () => {
  return {
    Extraction: mongoose.model('Extraction'),
    Intelligence: mongoose.model('Intelligence'),
    CircularTrading: mongoose.model('CircularTrading'),
    Explanation: mongoose.model('Explanation'),
    SiteVisit: mongoose.model('SiteVisit')
  };
};

// Graceful shutdown
const disconnectDatabases = async () => {
  try {
    if (prisma) {
      await prisma.$disconnect();
      logger.info('PostgreSQL disconnected');
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      logger.info('MongoDB disconnected');
    }
  } catch (error) {
    logger.error('Error during database disconnection:', error);
    throw error;
  }
};

module.exports = {
  connectPostgreSQL,
  connectMongoDB,
  getPrismaClient,
  getMongoModels,
  disconnectDatabases
};