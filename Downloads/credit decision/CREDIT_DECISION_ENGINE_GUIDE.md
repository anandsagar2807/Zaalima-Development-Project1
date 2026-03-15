# Credit Decision Engine - Complete Step-by-Step Guide

## Overview
This document provides a detailed step-by-step guide to building and implementing a comprehensive credit decision engine based on the existing MongoDB schemas and ML risk model architecture.

---

## Step 1: Application Intake & Document Collection

### 1.1 Application Creation
```javascript
// backend/src/services/applicationService.js
class ApplicationService {
  async createApplication(applicationData) {
    const application = {
      applicationId: generateApplicationId(),
      applicationNumber: `APP-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      companyId: applicationData.companyId,
      loanAmount: applicationData.loanAmount,
      loanPurpose: applicationData.loanPurpose,
      tenor: applicationData.tenor, // in months
      status: 'DRAFT',
      priority: 'MEDIUM',
      assignedTo: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        source: applicationData.source || 'DIRECT',
        referrer: applicationData.referrer,
        campaign: applicationData.campaign
      }
    };

    // Save to database
    return await this.db.applications.create(application);
  }
}
```

### 1.2 Document Checklist Generation
```javascript
// backend/src/services/documentService.js
class DocumentService {
  generateDocumentChecklist(application) {
    const baseDocuments = [
      { type: 'BANK_STATEMENT', required: true, description: 'Last 6 months bank statements' },
      { type: 'ITR', required: true, description: 'Last 3 years ITR filings' },
      { type: 'BALANCE_SHEET', required: true, description: 'Last 3 years audited balance sheets' },
      { type: 'PNL_STATEMENT', required: true, description: 'Last 3 years profit & loss statements' },
      { type: 'GST_RETURN_1', required: true, description: 'Last 12 months GSTR-1' },
      { type: 'GST_RETURN_3B', required: true, description: 'Last 12 months GSTR-3B' },
      { type: 'GST_2A', required: true, description: 'Last 12 months GSTR-2A' },
      { type: 'MOA_AOA', required: true, description: 'Memorandum and Articles of Association' }
    ];

    const conditionalDocuments = [];
    
    // Add CIBIL report for larger loans
    if (application.loanAmount > 10000000) {
      conditionalDocuments.push({
        type: 'CIBIL_REPORT',
        required: true,
        description: 'Latest CIBIL commercial report'
      });
    }

    // Add sector-specific documents
    if (application.sector === 'MANUFACTURING') {
      conditionalDocuments.push({
        type: 'ANNUAL_REPORT',
        required: false,
        description: 'Latest annual report'
      });
    }

    return [...baseDocuments, ...conditionalDocuments];
  }
}
```

### 1.3 Document Upload & Validation
```javascript
// backend/src/services/documentService.js
class DocumentService {
  async uploadDocument(applicationId, documentData, fileBuffer) {
    // Validate file
    const validation = await this.validateDocument(documentData.documentType, fileBuffer);
    if (!validation.isValid) {
      throw new Error(`Invalid document: ${validation.error}`);
    }

    const document = {
      documentId: generateDocumentId(),
      applicationId,
      documentType: documentData.documentType,
      fileName: documentData.fileName,
      fileSize: fileBuffer.length,
      mimeType: documentData.mimeType,
      status: 'UPLOADED',
      uploadedAt: new Date(),
      metadata: {
        uploadedBy: documentData.uploadedBy,
        uploadMethod: documentData.uploadMethod || 'MANUAL'
      }
    };

    // Save document metadata
    const savedDoc = await this.db.documents.create(document);
    
    // Trigger OCR processing
    await this.triggerOCRProcessing(savedDoc.documentId, fileBuffer);
    
    return savedDoc;
  }

  async validateDocument(documentType, fileBuffer) {
    const validators = {
      'BANK_STATEMENT': this.validateBankStatement,
      'ITR': this.validateITR,
      'GST_RETURN_1': this.validateGSTR,
      // ... other validators
    };

    const validator = validators[documentType];
    return validator ? await validator(fileBuffer) : { isValid: true };
  }
}
```

---

## Step 2: OCR & Data Extraction Pipeline

### 2.1 OCR Processing Service
```javascript
// backend/src/services/ocrService.js
class OCRService {
  async processDocument(documentId, fileBuffer) {
    try {
      // Step 1: Text extraction using OCR
      const rawText = await this.performOCR(fileBuffer);
      
      // Step 2: Document classification
      const docType = await this.classifyDocument(rawText);
      
      // Step 3: Structured data extraction
      const extractedData = await this.extractData(rawText, docType);
      
      // Step 4: Quality assessment
      const confidenceScore = this.calculateConfidence(rawText, extractedData);
      
      // Step 5: Save to MongoDB
      const extraction = {
        _id: documentId,
        applicationId: await this.getApplicationId(documentId),
        documentType: docType,
        rawText,
        confidenceScore,
        extractedData,
        processingTime: Date.now() - startTime,
        extractionVersion: '1.2.0',
        createdAt: new Date()
      };

      await this.mongoDB.Extraction.create(extraction);
      
      // Step 6: Trigger downstream processing
      await this.triggerDownstreamProcessing(documentId, extractedData);
      
      return extraction;
    } catch (error) {
      await this.handleOCRException(documentId, error);
      throw error;
    }
  }

  async performOCR(fileBuffer) {
    // Integration with OCR service (Google Vision, AWS Textract, etc.)
    const ocrResult = await this.ocrClient.documentTextDetection({
      document: { content: fileBuffer.toString('base64') }
    });
    
    return ocrResult.text;
  }

  async extractData(rawText, docType) {
    const extractors = {
      'BANK_STATEMENT': this.extractBankData,
      'ITR': this.extractITRData,
      'GST_RETURN_1': this.extractGSTR1Data,
      'GST_RETURN_3B': this.extractGSTR3BData,
      'BALANCE_SHEET': this.extractFinancialData,
      'PNL_STATEMENT': this.extractFinancialData
    };

    const extractor = extractors[docType];
    return extractor ? await extractor(rawText) : {};
  }
}
```

### 2.2 Financial Data Extraction
```javascript
// backend/src/services/extraction/financialExtractor.js
class FinancialDataExtractor {
  async extractBalanceSheetData(rawText) {
    const patterns = {
      totalAssets: /total\s+assets?[\s:]*₹?\s*([\d,]+\.?\d*)/i,
      totalLiabilities: /total\s+liabilit(y|ies)[\s:]*₹?\s*([\d,]+\.?\d*)/i,
      netWorth: /net\s+worth[\s:]*₹?\s*([\d,]+\.?\d*)/i,
      currentAssets: /current\s+assets?[\s:]*₹?\s*([\d,]+\.?\d*)/i,
      currentLiabilities: /current\s+liabilit(y|ies)[\s:]*₹?\s*([\d,]+\.?\d*)/i
    };

    const extractedData = {};
    
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = rawText.match(pattern);
      if (match) {
        extractedData[key] = parseFloat(match[1].replace(/,/g, ''));
      }
    }

    // Calculate derived ratios
    if (extractedData.currentAssets && extractedData.currentLiabilities) {
      extractedData.currentRatio = extractedData.currentAssets / extractedData.currentLiabilities;
    }

    return extractedData;
  }

  async extractBankStatementData(rawText) {
    const transactions = [];
    const lines = rawText.split('\n');
    
    let balance = 0;
    let totalCredits = 0;
    let totalDebits = 0;
    
    for (const line of lines) {
      const transaction = this.parseTransactionLine(line);
      if (transaction) {
        transactions.push(transaction);
        
        if (transaction.type === 'CREDIT') {
          totalCredits += transaction.amount;
        } else {
          totalDebits += transaction.amount;
        }
        
        balance = transaction.balance;
      }
    }

    return {
      transactions,
      averageBalance: this.calculateAverageBalance(transactions),
      bounceCount: this.countBouncedTransactions(transactions),
      highValueTransactions: this.identifyHighValueTransactions(transactions),
      totalCredits,
      totalDebits,
      closingBalance: balance
    };
  }
}
```

### 2.3 GST Data Validation
```javascript
// backend/src/services/extraction/gstExtractor.js
class GSTR1Extractor {
  async extractGSTR1Data(rawText) {
    const gstr1Data = {
      supplierList: this.extractSuppliers(rawText),
      customerList: this.extractCustomers(rawText),
      totalTaxableValue: this.extractTotalTaxableValue(rawText),
      igst: this.extractIGST(rawText),
      cgst: this.extractCGST(rawText),
      sgst: this.extractSGST(rawText),
      filingPeriod: this.extractFilingPeriod(rawText)
    };

    // Quality checks
    const reconciliation = await this.reconcileGSTR1(gstr1Data);
    
    return {
      ...gstr1Data,
      qualityChecks: {
        supplierCount: gstr1Data.supplierList.length,
        customerCount: gstr1Data.customerList.length,
        reconciliationVariance: reconciliation.variance,
        isReconciled: reconciliation.isReconciled
      }
    };
  }

  extractSuppliers(rawText) {
    // Pattern matching for supplier details in GSTR-1
    const supplierPattern = /(\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d{1}[Z]{1}[A-Z\d]{1})\s+(.+?)\s+₹?\s*([\d,]+\.?\d*)/g;
    const suppliers = [];
    
    let match;
    while ((match = supplierPattern.exec(rawText)) !== null) {
      suppliers.push({
        gstin: match[1],
        name: match[2].trim(),
        totalValue: parseFloat(match[3].replace(/,/g, ''))
      });
    }
    
    return suppliers;
  }
}
```

---

## Step 3: Data Validation & Quality Checks

### 3.1 Cross-Document Validation
```javascript
// backend/src/services/validationService.js
class ValidationService {
  async performCrossDocumentValidation(applicationId) {
    const extractions = await this.getAllExtractions(applicationId);
    
    const validations = {
      financialConsistency: await this.validateFinancialConsistency(extractions),
      gstBankReconciliation: await this.validateGSTBankReconciliation(extractions),
      turnoverMatching: await this.validateTurnoverMatching(extractions),
      taxPaymentConsistency: await this.validateTaxPayments(extractions)
    };

    // Calculate validation score
    const overallScore = this.calculateValidationScore(validations);
    
    return {
      validations,
      overallScore,
      requiresManualReview: overallScore < 70,
      validationFlags: this.generateValidationFlags(validations)
    };
  }

  async validateGSTBankReconciliation(extractions) {
    const gstr1Data = extractions.find(e => e.documentType === 'GST_RETURN_1');
    const bankData = extractions.find(e => e.documentType === 'BANK_STATEMENT');
    
    if (!gstr1Data || !bankData) {
      return { isValid: false, reason: 'Missing required documents' };
    }

    const gstrTurnover = gstr1Data.extractedData.totalTaxableValue;
    const bankTurnover = bankData.extractedData.totalCredits;
    
    const variance = Math.abs(gstrTurnover - bankTurnover) / gstrTurnover;
    const isValid = variance < 0.20; // Allow 20% variance
    
    return {
      isValid,
      variance: variance * 100,
      gstrTurnover,
      bankTurnover,
      explanation: isValid ? 
        'GST and bank turnover are consistent' : 
        `Significant variance detected: ${variance.toFixed(1)}%`
    };
  }

  async validateFinancialConsistency(extractions) {
    const balanceSheets = extractions.filter(e => e.documentType === 'BALANCE_SHEET');
    const pnlStatements = extractions.filter(e => e.documentType === 'PNL_STATEMENT');
    
    const inconsistencies = [];
    
    // Check year-over-year consistency
    for (let i = 1; i < balanceSheets.length; i++) {
      const prevYear = balanceSheets[i-1].extractedData.netWorth;
      const currentYear = balanceSheets[i].extractedData.netWorth;
      
      if (currentYear < prevYear * 0.8) { // More than 20% decline
        inconsistencies.push({
          type: 'NET_WORTH_DECLINE',
          severity: 'HIGH',
          details: `Net worth declined by ${((prevYear - currentYear) / prevYear * 100).toFixed(1)}%`
        });
      }
    }

    return {
      isValid: inconsistencies.length === 0,
      inconsistencies,
      overallTrend: this.analyzeFinancialTrend(balanceSheets, pnlStatements)
    };
  }
}
```

### 3.2 Data Quality Score Calculation
```javascript
// backend/src/services/qualityService.js
class DataQualityService {
  calculateDataQualityScore(extractions) {
    const qualityIndicators = {
      completeness: this.calculateCompletenessScore(extractions),
      consistency: this.calculateConsistencyScore(extractions),
      accuracy: this.calculateAccuracyScore(extractions),
      timeliness: this.calculateTimelinessScore(extractions)
    };

    const weightedScore = (
      qualityIndicators.completeness * 0.40 +
      qualityIndicators.consistency * 0.30 +
      qualityIndicators.accuracy * 0.20 +
      qualityIndicators.timeliness * 0.10
    );

    return {
      overallScore: weightedScore,
      grade: this.getQualityGrade(weightedScore),
      indicators: qualityIndicators,
      recommendations: this.generateQualityRecommendations(qualityIndicators)
    };
  }

  calculateCompletenessScore(extractions) {
    const requiredDocs = ['ITR', 'BANK_STATEMENT', 'BALANCE_SHEET', 'GST_RETURN_1'];
    const presentDocs = extractions.map(e => e.documentType);
    
    const completeness = requiredDocs.filter(doc => 
      presentDocs.includes(doc)
    ).length / requiredDocs.length;
    
    return completeness * 100;
  }

  getQualityGrade(score) {
    if (score >= 90) return 'EXCELLENT';
    if (score >= 75) return 'GOOD';
    if (score >= 60) return 'ACCEPTABLE';
    if (score >= 40) return 'POOR';
    return 'CRITICAL';
  }
}
```

---

## Step 4: Intelligent Research & External Data Gathering

### 4.1 Automated Research Pipeline
```javascript
// backend/src/services/researchService.js
class ResearchService {
  async initiateResearch(applicationId, companyDetails) {
    const researchTasks = [
      { name: 'MCA_RESEARCH', priority: 'HIGH', handler: this.performMCAResearch },
      { name: 'LITIGATION_CHECK', priority: 'HIGH', handler: this.performLitigationCheck },
      { name: 'CIBIL_REPORT', priority: 'HIGH', handler: this.fetchCIBILReport },
      { name: 'NEWS_ANALYSIS', priority: 'MEDIUM', handler: this.performNewsAnalysis },
      { name: 'REGULATORY_CHECKS', priority: 'MEDIUM', handler: this.performRegulatoryChecks },
      { name: 'SECTOR_ANALYSIS', priority: 'MEDIUM', handler: this.performSectorAnalysis }
    ];

    const researchResults = {
      researchId: generateResearchId(),
      applicationId,
      initiatedAt: new Date(),
      status: 'IN_PROGRESS',
      tasks: []
    };

    // Execute research tasks in parallel
    const taskPromises = researchTasks.map(async (task) => {
      try {
        const result = await task.handler(companyDetails);
        return {
          taskName: task.name,
          status: 'COMPLETED',
          result,
          completedAt: new Date()
        };
      } catch (error) {
        return {
          taskName: task.name,
          status: 'FAILED',
          error: error.message,
          completedAt: new Date()
        };
      }
    });

    researchResults.tasks = await Promise.all(taskPromises);
    researchResults.status = 'COMPLETED';
    researchResults.completedAt = new Date();

    // Save to MongoDB
    await this.saveResearchResults(researchResults);
    
    return researchResults;
  }
}
```

### 4.2 MCA Research Integration
```javascript
// backend/src/services/research/mcaService.js
class MCAResearchService {
  async performMCAResearch(companyDetails) {
    const companyData = await this.fetchCompanyDetails(companyDetails.cin);
    
    return {
      companyStatus: companyData.status,
      incorporationDate: companyData.incorporationDate,
      businessActivity: companyData.businessActivity,
      authorizedCapital: companyData.authorizedCapital,
      paidupCapital: companyData.paidupCapital,
      directors: companyData.directors.map(d => ({
        din: d.din,
        name: d.name,
        designation: d.designation,
        appointmentDate: d.appointmentDate,
        status: d.status,
        disqualifications: d.disqualifications || []
      })),
      charges: companyData.charges.map(c => ({
        chargeId: c.chargeId,
        chargeType: c.chargeType,
        amount: c.amount,
        date: c.date,
        status: c.status
      })),
      filingCompliance: companyData.filingCompliance,
      annualReturns: companyData.annualReturns,
      // Risk indicators
      riskFlags: this.analyzeMCARisks(companyData)
    };
  }

  analyzeMCARisks(companyData) {
    const flags = [];
    
    // Check director disqualifications
    const disqualifiedDirectors = companyData.directors.filter(d => 
      d.disqualifications && d.disqualifications.length > 0
    );
    
    if (disqualifiedDirectors.length > 0) {
      flags.push({
        type: 'DIRECTOR_DISQUALIFICATION',
        severity: 'HIGH',
        details: `${disqualifiedDirectors.length} directors have disqualifications`,
        directors: disqualifiedDirectors.map(d => d.name)
      });
    }

    // Check pending charges
    const pendingCharges = companyData.charges.filter(c => c.status === 'PENDING');
    if (pendingCharges.length > 3) {
      flags.push({
        type: 'EXCESSIVE_CHARGES',
        severity: 'MEDIUM',
        details: `${pendingCharges.length} pending charges detected`
      });
    }

    // Check filing compliance
    if (companyData.filingCompliance.status === 'NON_COMPLIANT') {
      flags.push({
        type: 'FILING_NON_COMPLIANCE',
        severity: 'MEDIUM',
        details: 'Company has filing compliance issues'
      });
    }

    return flags;
  }
}
```

### 4.3 Litigation Research
```javascript
// backend/src/services/research/litigationService.js
class LitigationResearchService {
  async performLitigationCheck(companyDetails) {
    const litigationData = await this.searchLitigation(companyDetails);
    
    return {
      totalCases: litigationData.cases.length,
      activeCases: litigationData.cases.filter(c => c.status === 'ACTIVE').length,
      resolvedCases: litigationData.cases.filter(c => c.status === 'RESOLVED').length,
      casesByType: this.categorizeLitigation(litigationData.cases),
      totalClaimAmount: litigationData.cases.reduce((sum, c) => sum + c.claimAmount, 0),
      highSeverityCases: litigationData.cases.filter(c => c.severity === 'HIGH'),
      recentCases: this.getRecentCases(litigationData.cases, 12), // Last 12 months
      
      // Litigation impact analysis
      riskAssessment: this.assessLitigationRisk(litigationData.cases),
      financialImpact: this.calculateFinancialImpact(litigationData.cases),
      
      // Detailed case information
      caseDetails: litigationData.cases.map(case => ({
        caseNumber: case.caseNumber,
        court: case.court,
        type: case.type, // CRIMINAL, CIVIL, TAX, etc.
        severity: case.severity, // HIGH, MEDIUM, LOW
        claimAmount: case.claimAmount,
        status: case.status,
        filingDate: case.filingDate,
        lastHearingDate: case.lastHearingDate,
        nextHearingDate: case.nextHearingDate,
        opposingParty: case.opposingParty,
        caseSummary: case.summary
      }))
    };
  }

  assessLitigationRisk(cases) {
    let riskScore = 0;
    const riskFactors = [];
    
    // Criminal cases - high impact
    const criminalCases = cases.filter(c => c.type === 'CRIMINAL');
    if (criminalCases.length > 0) {
      riskScore += criminalCases.length * 30;
      riskFactors.push({
        type: 'CRIMINAL_CASES',
        count: criminalCases.length,
        impact: criminalCases.length * 30
      });
    }

    // High value financial disputes
    const highValueCases = cases.filter(c => c.claimAmount > 10000000);
    riskScore += highValueCases.length * 20;
    
    // Recent litigation
    const recentCases = this.getRecentCases(cases, 6);
    riskScore += recentCases.length * 10;

    return {
      riskScore,
      riskLevel: riskScore > 50 ? 'HIGH' : riskScore > 20 ? 'MEDIUM' : 'LOW',
      riskFactors
    };
  }
}
```

### 4.4 News & Social Media Analysis
```javascript
// backend/src/services/research/newsService.js
class NewsAnalysisService {
  async performNewsAnalysis(companyDetails) {
    const newsArticles = await this.fetchCompanyNews(companyDetails.companyName);
    
    // Sentiment analysis on news articles
    const analyzedNews = await Promise.all(
      newsArticles.map(async article => ({
        ...article,
        sentiment: await this.analyzeSentiment(article.content),
        entities: await this.extractEntities(article.content),
        riskCategories: this.classifyRiskCategories(article.content)
      }))
    );

    return {
      totalArticles: analyzedNews.length,
      sentimentBreakdown: {
        positive: analyzedNews.filter(a => a.sentiment.category === 'POSITIVE').length,
        negative: analyzedNews.filter(a => a.sentiment.category === 'NEGATIVE').length,
        neutral: analyzedNews.filter(a => a.sentiment.category === 'NEUTRAL').length
      },
      recentHeadlines: analyzedNews.slice(0, 10).map(a => ({
        title: a.title,
        source: a.source,
        publishedDate: a.publishedDate,
        sentiment: a.sentiment.category,
        riskLevel: this.determineRiskLevel(a)
      })),
      trendAnalysis: this.analyzeNewsTrend(analyzedNews),
      keyMentions: this.extractKeyMentions(analyzedNews),
      
      // Save detailed analysis to MongoDB
      detailedAnalysis: analyzedNews.map(article => ({
        _id: generateDocumentId(),
        applicationId: companyDetails.applicationId,
        companyId: companyDetails.companyId,
        source: 'NEWS',
        title: article.title,
        content: article.content,
        publishedDate: article.publishedDate,
        sentiment: article.sentiment,
        entities: article.entities,
        riskCategories: article.riskCategories,
        riskImpact: this.determineRiskImpact(article),
        scrapedAt: new Date()
      }))
    };
  }

  async analyzeSentiment(text) {
    // Use NLP library or ML model for sentiment analysis
    const sentiment = await this.nlpClient.analyzeSentiment({ document: { content: text } });
    
    return {
      polarity: sentiment.documentSentiment.score,
      magnitude: sentiment.documentSentiment.magnitude,
      category: this.categorizeSentiment(sentiment.documentSentiment.score)
    };
  }

  determineRiskLevel(article) {
    if (article.sentiment.category === 'NEGATIVE' && 
        article.riskCategories.some(cat => ['FRAUD', 'BANKRUPTCY', 'REGULATORY'].includes(cat))) {
      return 'HIGH';
    }
    
    if (article.sentiment.category === 'NEGATIVE') {
      return 'MEDIUM';
    }
    
    return article.sentiment.category === 'POSITIVE' ? 'LOW' : 'NEUTRAL';
  }
}
```

---

## Step 5: Primary Data Collection & Site Visits

### 5.1 Primary Input Questionnaire Design
```javascript
// backend/src/services/primaryInputService.js
class PrimaryInputService {
  generateQuestionnaire(application) {
    return {
      managementAssesment: {
        promoters: [
          {
            name: '',
            age: '',
            qualification: '',
            experience: '',
            otherBusinesses: '',
            netWorth: '',
            credibility: { type: 'RATING', min: 1, max: 10, value: null },
            involvement: { type: 'SELECT', options: ['ACTIVE', 'MODERATE', 'MINIMAL'], value: null }
          }
        ],
        managementTeam: {
          keyPersonnel: [],
          attritionRate: '',
          employeeCount: '',
          skillLevel: { type: 'RATING', min: 1, max: 10, value: null }
        },
        governance: {
          boardComposition: '',
          boardMeetings: '',
          auditorChanges: '',
          relatedPartyTransactions: '',
          internalControls: { type: 'RATING', min: 1, max: 10, value: null }
        }
      },
      
      businessAssessment: {
        operations: {
          capacityUtilization: '',
          technologyLevel: '',
          supplyChain: '',
          customerConcentration: '',
          supplierDependency: '',
          competitivePosition: { type: 'SELECT', options: ['LEADER', 'STRONG', 'AVERAGE', 'WEAK'], value: null }
        },
        marketPosition: {
          marketShare: '',
          growthProspects: '',
          barriersToEntry: '',
          customerFeedback: { type: 'RATING', min: 1, max: 10, value: null }
        },
        industryOutlook: {
          sectorGrowth: '',
          regulatoryEnvironment: '',
          technologicalChanges: '',
          competitiveLandscape: ''
        }
      },
      
      financialReview: {
        accountingPractices: { type: 'SELECT', options: ['EXCELLENT', 'GOOD', 'AVERAGE', 'POOR'], value: null },
        cashFlowManagement: { type: 'RATING', min: 1, max: 10, value: null },
        workingCapitalCycle: '',
        creditTerms: '',
        paymentHistory: { type: 'SELECT', options: ['EXCELLENT', 'GOOD', 'AVERAGE', 'POOR'], value: null },
        bankingRelationships: {
          currentBanks: [],
          facilities: [],
          limits: [],
          relationshipDuration: ''
        }
      },
      
      siteDetails: {
        location: '',
        infrastructure: { type: 'RATING', min: 1, max: 10, value: null },
        equipmentCondition: { type: 'RATING', min: 1, max: 10, value: null },
        housekeeping: { type: 'RATING', min: 1, max: 10, value: null },
        safetyStandards: { type: 'RATING', min: 1, max: 10, value: null },
        photos: [],
        visitDate: '',
        conductedBy: ''
      },
      
      riskAssessment: {
        operationalRisks: [],
        marketRisks: [],
        financialRisks: [],
        regulatoryRisks: [],
        keyMitigants: [],
        earlyWarningIndicators: []
      },
      
      overallAssessment: {
        managementQuality: { type: 'RATING', min: 1, max: 10, value: null },
        businessProspects: { type: 'RATING', min: 1, max: 10, value: null },
        financialHealth: { type: 'RATING', min: 1, max: 10, value: null },
        willingnessToPay: { type: 'RATING', min: 1, max: 10, value: null },
        recommendation: { type: 'SELECT', options: ['APPROVE', 'APPROVE_WITH_CONDITIONS', 'REJECT'], value: null },
        comments: ''
      }
    };
  }
}
```

### 5.2 Site Visit Management
```javascript
// backend/src/services/siteVisitService.js
class SiteVisitService {
  async createSiteVisit(applicationId, visitData) {
    const siteVisit = {
      visitId: generateVisitId(),
      applicationId,
      scheduledDate: visitData.scheduledDate,
      conductedDate: visitData.conductedDate || null,
      visitedBy: visitData.visitedBy,
      visitType: visitData.visitType || 'INITIAL',
      status: 'SCHEDULED',
      
      visitDetails: {
        location: visitData.location,
        attendees: visitData.attendees || [],
        observations: visitData.observations || {},
        photos: visitData.photos || [],
        documentsCollected: visitData.documentsCollected || []
      },
      
      assessment: {
        infrastructureRating: visitData.infrastructureRating,
        operationsRating: visitData.operationsRating,
        managementInteraction: visitData.managementInteraction,
        housekeepingRating: visitData.housekeepingRating,
        safetyCompliance: visitData.safetyCompliance,
        overallImpression: visitData.overallImpression
      },
      
      followUpActions: visitData.followUpActions || [],
      nextVisitRequired: visitData.nextVisitRequired || false,
      nextVisitDate: visitData.nextVisitDate,
      
      metadata: {
        createdBy: visitData.createdBy,
        duration: visitData.duration,
        distance: visitData.distance
      },
      
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return await this.db.siteVisits.create(siteVisit);
  }

  async conductVisit(visitId, visitData) {
    const updates = {
      conductedDate: new Date(),
      status: 'COMPLETED',
      visitDetails: {
        observations: visitData.observations,
        photos: this.processVisitPhotos(visitData.photos),
        documentsCollected: visitData.documentsCollected,
        discussionNotes: visitData.discussionNotes,
        keyFindings: visitData.keyFindings
      },
      assessment: visitData.assessment,
      followUpActions: visitData.followUpActions,
      updatedAt: new Date()
    };

    const updatedVisit = await this.db.siteVisits.findByIdAndUpdate(visitId, updates, { new: true });
    
    // Trigger score adjustment based on site visit findings
    await this.triggerScoreAdjustment(updatedVisit.applicationId, updatedVisit.assessment);
    
    return updatedVisit;
  }
}
```

### 5.3 Score Adjustment from Primary Input
```javascript
// backend/src/services/scoring/scoreAdjustmentService.js
class ScoreAdjustmentService {
  async applyPrimaryInputAdjustment(applicationId, primaryInput) {
    const currentScore = await this.getCurrentScore(applicationId);
    
    const adjustments = [];
    
    // Management quality adjustment
    if (primaryInput.overallAssessment.managementQuality) {
      const mgmtAdjustment = this.calculateManagementAdjustment(
        primaryInput.overallAssessment.managementQuality
      );
      adjustments.push(mgmtAdjustment);
    }

    // Infrastructure assessment
    if (primaryInput.siteDetails.infrastructure) {
      const infraAdjustment = this.calculateInfrastructureAdjustment(
        primaryInput.siteDetails.infrastructure
      );
      adjustments.push(infraAdjustment);
    }

    // Business prospects adjustment
    if (primaryInput.overallAssessment.businessProspects) {
      const businessAdjustment = this.calculateBusinessAdjustment(
        primaryInput.overallAssessment.businessProspects
      );
      adjustments.push(businessAdjustment);
    }

    // Overall assessment adjustment
    if (primaryInput.overallAssessment.recommendation) {
      const recommendationAdjustment = this.calculateRecommendationAdjustment(
        primaryInput.overallAssessment.recommendation,
        primaryInput.overallAssessment.comments
      );
      adjustments.push(recommendationAdjustment);
    }

    // Calculate total adjustment
    const totalAdjustment = adjustments.reduce((sum, adj) => sum + adj.impact, 0);
    
    // Apply adjustment with bounds
    const adjustedScore = Math.max(0, Math.min(100, currentScore.finalScore + totalAdjustment));
    
    // Save adjustment details
    const adjustmentRecord = {
      adjustmentId: generateAdjustmentId(),
      applicationId,
      originalScore: currentScore.finalScore,
      adjustments: adjustments,
      totalAdjustment: totalAdjustment,
      adjustedScore: adjustedScore,
      adjustmentType: 'PRIMARY_INPUT',
      appliedAt: new Date(),
      appliedBy: primaryInput.updatedBy
    };

    await this.saveAdjustment(adjustmentRecord);
    
    return {
      originalScore: currentScore.finalScore,
      adjustedScore: adjustedScore,
      totalAdjustment: totalAdjustment,
      breakdown: adjustments
    };
  }

  calculateManagementAdjustment(managementRating) {
    // Scale: 1-10 to score impact
    const adjustmentMap = {
      10: 5,   // Excellent management +5 points
      9: 4,    // Very good management +4 points
      8: 3,    // Good management +3 points
      7: 2,    // Above average +2 points
      6: 1,    // Average +1 point
      5: 0,    // Below average, no adjustment
      4: -1,   // Weak management -1 point
      3: -2,   // Poor management -2 points
      2: -3,   // Very poor management -3 points
      1: -5    // Critical management issues -5 points
    };

    return {
      type: 'MANAGEMENT_QUALITY',
      impact: adjustmentMap[managementRating] || 0,
      details: `Management quality rating: ${managementRating}/10`,
      appliedTo: 'CHARACTER_SCORE'
    };
  }
}
```

---

## Step 6: Risk Scoring Engine (Five Cs Framework)

I'll continue with the remaining steps in the next message to keep this comprehensive but manageable.