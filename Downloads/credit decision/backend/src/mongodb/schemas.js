// MongoDB Schema - Unstructured/Document Data
// Using Mongoose ODM

// Extracted Document Data
const extractionSchema = new mongoose.Schema({
  _id: String, // Reference from PostgreSQL Document table
  applicationId: String,
  companyId: String,
  documentType: {
    type: String,
    enum: ['GST_RETURN_1', 'GST_RETURN_3B', 'GST_2A', 'ITR', 'BANK_STATEMENT', 
           'BALANCE_SHEET', 'PNL_STATEMENT', 'ANNUAL_REPORT', 'BOARD_RESOLUTION', 
           'CIBIL_REPORT', 'MOA_AOA', 'RATING_REPORT', 'SHAREHOLDING_PATTERN']
  },
  
  // OCR Extracted Text
  rawText: String,
  confidenceScore: Number,
  
  // Structured Extractions
  extractedData: {
    // Financial Data
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
    
    // GST Specific
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
    
    // ITR Specific
    itrData: {
      assessmentYear: String,
      grossTotalIncome: Number,
      totalTaxPaid: Number,
      refundClaimed: Number,
      tdsCredits: Number
    },
    
    // Bank Statement Specific
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
    
    // CIBIL Report
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
  
  // NLP Analysis
  nlpAnalysis: {
    commitments: [{
      type: String, // Guarantee, Loan, L/C
      amount: Number,
      beneficiary: String,
      endDate: Date
    }],
    contingentLiabilities: [{
      description: String,
      estimatedAmount: Number,
      probability: String // HIGH, MEDIUM, LOW
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
  
  // Risk Flags
  riskFlags: [{
    type: String,
    severity: String, // HIGH, MEDIUM, LOW
    description: String,
    supportingText: String
  }],
  
  // Metadata
  processingTime: Number,
  extractionVersion: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Web Scraped Intelligence
const intelligenceSchema = new mongoose.Schema({
  _id: String,
  applicationId: String,
  companyId: String,
  
  source: {
    type: String,
    enum: ['MCA', 'E_COURTS', 'NEWS', 'RBI', 'RATING_AGENCY', 'SOCIAL_MEDIA']
  },
  url: String,
  title: String,
  content: String,
  publishedDate: Date,
  
  // Sentiment Analysis
  sentiment: {
    polarity: Number, // -1 to 1
    category: { type: String, enum: ['POSITIVE', 'NEGATIVE', 'NEUTRAL'] },
    confidence: Number
  },
  
  // Entity Extraction
  entities: [{
    name: String,
    type: String, // PERSON, COMPANY, LOCATION, REGULATION
    relevanceScore: Number
  }],
  
  // Risk Classification
  riskImpact: {
    type: String,
    enum: ['POSITIVE', 'NEUTRAL', 'LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK', 'CRITICAL']
  },
  riskCategories: [String], // ['LITIGATION', 'FINANCIAL', 'REGULATORY']
  
  // Timestamps
  scrapedAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
});

// Circular Trading Detection
const circularTradingSchema = new mongoose.Schema({
  _id: String,
  applicationId: String,
  companyId: String,
  
  // Trade Network Analysis
  suspiciousSuppliers: [{
    gstin: String,
    name: String,
    transactionValue: Number,
    circularityScore: Number,
    reasons: [String]
  }],
  
  // Network Graph
  tradeNetwork: {
    nodes: [{
      gstin: String,
      name: String,
      type: String // COMPANY, SUPPLIER, CUSTOMER
    }],
    edges: [{
      from: String,
      to: String,
      value: Number,
      transactionCount: Number
    }]
  },
  
  // Risk Metrics
  circularTurnover: Number,
  percentageOfTotal: Number,
  riskLevel: String, // LOW, MEDIUM, HIGH, CRITICAL
  
  detectedAt: { type: Date, default: Date.now }
});

// Scoring Explanation Data
const explanationSchema = new mongoose.Schema({
  _id: String,
  applicationId: String,
  scoreId: String,
  
  // Detailed Breakdown
  scoreBreakdown: {
    fiveCs: {
      character: {
        baseScore: Number,
        contributingFactors: [{
          factor: String,
          impact: Number,
          details: String
        }]
      },
      capacity: {
        baseScore: Number,
        contributingFactors: [{
          factor: String,
          impact: Number,
          details: String
        }]
      },
      capital: {
        baseScore: Number,
        contributingFactors: [{
          factor: String,
          impact: Number,
          details: String
        }]
      },
      collateral: {
        baseScore: Number,
        contributingFactors: [{
          factor: String,
          impact: Number,
          details: String
        }]
      },
      conditions: {
        baseScore: Number,
        contributingFactors: [{
          factor: String,
          impact: Number,
          details: String
        }]
      }
    },
    
    // Detailed Financial Metrics
    financialMetrics: [{
      metric: String,
      value: Number,
      benchmark: Number,
      performance: String, // GOOD, AVERAGE, POOR
      impact: Number
    }],
    
    // Risk Adjustments
    riskAdjustments: [{
      type: String,
      description: String,
      impact: Number,
      severity: String
    }]
  },
  
  // Sensitivity Analysis
  sensitivityAnalysis: [{
    variable: String,
    currentValue: Number,
    sensitivity: Number,
    impactExplanation: String
  }],
  
  // Recommendation Logic
  recommendationLogic: {
    decision: String,
    confidence: Number,
    keyDrivers: [String],
    risks: [String],
    mitigants: [String]
  },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  Extraction: mongoose.model('Extraction', extractionSchema),
  Intelligence: mongoose.model('Intelligence', intelligenceSchema),
  CircularTrading: mongoose.model('CircularTrading', circularTradingSchema),
  Explanation: mongoose.model('Explanation', explanationSchema)
};