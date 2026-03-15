const { getPrismaClient, getMongoModels } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * Credit Scoring Service - Five Cs Framework
 * Implements comprehensive risk scoring based on:
 * - Character: Promoter credibility, litigation history, track record
 * - Capacity: Financial capacity, cash flow, repayment ability
 * - Capital: Net worth, leverage, equity contribution
 * - Collateral: Security coverage, asset quality
 * - Conditions: Sector conditions, business environment, market position
 */
class ScoringService {
  constructor() {
    this.prisma = null;
    this.mongoModels = null;
    
    // Default weights for Five Cs
    this.defaultWeights = {
      character: 0.20,
      capacity: 0.25,
      capital: 0.20,
      collateral: 0.15,
      conditions: 0.20
    };

    // Risk grade thresholds
    this.riskGrades = [
      { min: 85, grade: 'A+', category: 'Excellent' },
      { min: 75, grade: 'A', category: 'Good' },
      { min: 65, grade: 'B+', category: 'Acceptable' },
      { min: 55, grade: 'B', category: 'Marginal' },
      { min: 45, grade: 'C', category: 'Watchlist' },
      { min: 0, grade: 'D', category: 'Reject' }
    ];
  }

  init() {
    this.prisma = getPrismaClient();
    this.mongoModels = getMongoModels();
  }

  /**
   * Calculate comprehensive credit score for an application
   */
  async calculateScore(applicationId) {
    try {
      if (!this.prisma) this.init();

      logger.info(`Starting score calculation for application: ${applicationId}`);

      // Get application with all related data
      const application = await this.prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          company: true,
          documents: true,
          primaryInput: true,
          litigationRecords: true,
          researchData: true
        }
      });

      if (!application) {
        throw new Error('Application not found');
      }

      // Get extraction data from MongoDB
      const { Extraction, Intelligence, CircularTrading } = this.mongoModels;
      
      const extractions = await Extraction.find({ applicationId });
      const intelligence = await Intelligence.find({ applicationId });
      const circularTrading = await CircularTrading.findOne({ applicationId });

      // Calculate individual Five C scores
      const characterScore = await this.calculateCharacterScore(application, extractions, intelligence);
      const capacityScore = await this.calculateCapacityScore(application, extractions);
      const capitalScore = await this.calculateCapitalScore(application, extractions);
      const collateralScore = await this.calculateCollateralScore(application);
      const conditionsScore = await this.calculateConditionsScore(application, intelligence);

      // Get active scoring model weights
      const weights = await this.getActiveWeights();

      // Calculate weighted total score
      const totalScore = (
        characterScore.score * weights.character +
        capacityScore.score * weights.capacity +
        capitalScore.score * weights.capital +
        collateralScore.score * weights.collateral +
        conditionsScore.score * weights.conditions
      );

      // Determine risk grade
      const riskGrade = this.determineRiskGrade(totalScore);

      // Build positive and negative factors
      const { positiveFactors, negativeFactors } = this.buildFactors(
        characterScore,
        capacityScore,
        capitalScore,
        collateralScore,
        conditionsScore
      );

      // Save score to database
      const creditScore = await this.prisma.creditScore.create({
        data: {
          id: uuidv4(),
          applicationId,
          characterScore: characterScore.score,
          capacityScore: capacityScore.score,
          capitalScore: capitalScore.score,
          collateralScore: collateralScore.score,
          conditionsScore: conditionsScore.score,
          financialRatioScore: capacityScore.financialRatioScore,
          gstAnalysisScore: capacityScore.gstAnalysisScore,
          bankStatementScore: capacityScore.bankStatementScore,
          litigationImpact: characterScore.litigationImpact,
          sectorRiskImpact: conditionsScore.sectorRiskImpact,
          totalScore,
          weightedScore: totalScore,
          riskGrade: riskGrade.grade,
          positiveFactors: positiveFactors,
          negativeFactors: negativeFactors,
          sensitivityAnalysis: this.generateSensitivityAnalysis(totalScore, weights)
        }
      });

      // Save detailed explanation to MongoDB
      await this.saveExplanation(applicationId, creditScore.id, {
        fiveCs: {
          character: characterScore,
          capacity: capacityScore,
          capital: capitalScore,
          collateral: collateralScore,
          conditions: conditionsScore
        },
        recommendationLogic: {
          decision: this.getRecommendation(totalScore),
          confidence: this.calculateConfidence(totalScore, extractions.length),
          keyDrivers: positiveFactors.slice(0, 3).map(f => f.factor),
          risks: negativeFactors.slice(0, 3).map(f => f.factor),
          mitigants: this.identifyMitigants(negativeFactors)
        }
      });

      // Update application with score
      await this.prisma.application.update({
        where: { id: applicationId },
        data: {
          finalScore: totalScore,
          riskGrade: riskGrade.grade,
          recommendedAmount: this.calculateRecommendedAmount(application, totalScore),
          riskPremium: this.calculateRiskPremium(totalScore)
        }
      });

      logger.info(`Score calculated for application ${applicationId}: ${totalScore} (${riskGrade.grade})`);

      return {
        success: true,
        score: creditScore,
        riskGrade
      };
    } catch (error) {
      logger.error('Error calculating score:', error);
      throw error;
    }
  }

  /**
   * Calculate Character Score
   * Based on: Promoter credibility, litigation history, management track record
   */
  async calculateCharacterScore(application, extractions, intelligence) {
    let score = 70; // Base score
    const factors = [];
    let litigationImpact = 0;

    // Check litigation records
    const litigations = application.litigationRecords || [];
    const activeLitigations = litigations.filter(l => l.status === 'ACTIVE');
    const criticalLitigations = activeLitigations.filter(l => l.severity === 'CRITICAL' || l.severity === 'HIGH');

    if (criticalLitigations.length > 0) {
      litigationImpact = -20;
      factors.push({
        factor: 'Critical Litigation',
        impact: -20,
        details: `${criticalLitigations.length} critical/high severity litigations found`
      });
    } else if (activeLitigations.length > 0) {
      litigationImpact = -10;
      factors.push({
        factor: 'Active Litigation',
        impact: -10,
        details: `${activeLitigations.length} active litigations found`
      });
    }

    score += litigationImpact;

    // Check company vintage
    if (application.company?.incorporationDate) {
      const yearsInBusiness = this.getYearsDifference(
        new Date(application.company.incorporationDate),
        new Date()
      );
      
      if (yearsInBusiness >= 10) {
        score += 5;
        factors.push({
          factor: 'Established Business',
          impact: 5,
          details: `${yearsInBusiness} years in operation`
        });
      } else if (yearsInBusiness < 3) {
        score -= 5;
        factors.push({
          factor: 'New Business',
          impact: -5,
          details: 'Less than 3 years in operation'
        });
      }
    }

    // Check CIBIL score
    const cibilExtraction = extractions.find(e => e.documentType === 'CIBIL_REPORT');
    if (cibilExtraction?.extractedData?.cibilData?.score) {
      const cibilScore = cibilExtraction.extractedData.cibilData.score;
      if (cibilScore >= 750) {
        score += 10;
        factors.push({
          factor: 'Excellent Credit History',
          impact: 10,
          details: `CIBIL score: ${cibilScore}`
        });
      } else if (cibilScore >= 700) {
        score += 5;
        factors.push({
          factor: 'Good Credit History',
          impact: 5,
          details: `CIBIL score: ${cibilScore}`
        });
      } else if (cibilScore < 600) {
        score -= 10;
        factors.push({
          factor: 'Poor Credit History',
          impact: -10,
          details: `CIBIL score: ${cibilScore}`
        });
      }
    }

    // Check news sentiment
    const negativeNews = intelligence.filter(i => 
      i.sentiment?.category === 'NEGATIVE' && 
      ['HIGH_RISK', 'CRITICAL'].includes(i.riskImpact)
    );
    
    if (negativeNews.length > 0) {
      score -= 5;
      factors.push({
        factor: 'Negative News',
        impact: -5,
        details: `${negativeNews.length} negative news items detected`
      });
    }

    // Primary input adjustments
    if (application.primaryInput?.managementQuality) {
      const mgmtQuality = application.primaryInput.managementQuality;
      const adjustment = (mgmtQuality - 5) * 2; // -10 to +10 range
      score += adjustment;
      factors.push({
        factor: 'Management Quality Assessment',
        impact: adjustment,
        details: `Management quality rating: ${mgmtQuality}/10`
      });
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      factors,
      litigationImpact,
      baseScore: 70
    };
  }

  /**
   * Calculate Capacity Score
   * Based on: Financial ratios, cash flow, GST analysis, bank statement analysis
   */
  async calculateCapacityScore(application, extractions) {
    let score = 70;
    const factors = [];
    let financialRatioScore = 0;
    let gstAnalysisScore = 0;
    let bankStatementScore = 0;

    // Financial ratios from balance sheet/P&L
    const financialExtraction = extractions.find(e => 
      ['BALANCE_SHEET', 'PNL_STATEMENT'].includes(e.documentType)
    );

    if (financialExtraction?.extractedData?.financials) {
      const financials = financialExtraction.extractedData.financials;
      
      // Current Ratio
      if (financials.currentRatio) {
        if (financials.currentRatio >= 1.5) {
          financialRatioScore += 15;
          factors.push({
            factor: 'Strong Liquidity',
            impact: 15,
            details: `Current ratio: ${financials.currentRatio.toFixed(2)}`
          });
        } else if (financials.currentRatio < 1) {
          financialRatioScore -= 10;
          factors.push({
            factor: 'Weak Liquidity',
            impact: -10,
            details: `Current ratio: ${financials.currentRatio.toFixed(2)} (below 1)`
          });
        }
      }

      // Debt to Equity
      if (financials.debtToEquity) {
        if (financials.debtToEquity <= 2) {
          financialRatioScore += 10;
          factors.push({
            factor: 'Conservative Leverage',
            impact: 10,
            details: `Debt-to-equity: ${financials.debtToEquity.toFixed(2)}`
          });
        } else if (financials.debtToEquity > 3) {
          financialRatioScore -= 15;
          factors.push({
            factor: 'High Leverage',
            impact: -15,
            details: `Debt-to-equity: ${financials.debtToEquity.toFixed(2)} (above 3)`
          });
        }
      }

      // Net Profit Margin (if turnover and net profit available)
      if (financials.turnover && financials.netProfit) {
        const margin = (financials.netProfit / financials.turnover) * 100;
        if (margin >= 10) {
          financialRatioScore += 10;
          factors.push({
            factor: 'Healthy Profit Margins',
            impact: 10,
            details: `Net profit margin: ${margin.toFixed(1)}%`
          });
        } else if (margin < 0) {
          financialRatioScore -= 15;
          factors.push({
            factor: 'Loss Making',
            impact: -15,
            details: `Negative profit margin: ${margin.toFixed(1)}%`
          });
        }
      }
    }

    // GST Analysis
    const gstExtraction = extractions.find(e => 
      ['GST_RETURN_1', 'GST_RETURN_3B'].includes(e.documentType)
    );

    if (gstExtraction?.extractedData?.gstData) {
      gstAnalysisScore = 10; // Base for having GST data
      
      const gstData = gstExtraction.extractedData.gstData;
      
      // Check for filing consistency
      if (gstData.totalTaxableValue && gstData.filingPeriod) {
        factors.push({
          factor: 'GST Compliance',
          impact: 10,
          details: 'Regular GST filings observed'
        });
      }
    }

    // Bank Statement Analysis
    const bankExtraction = extractions.find(e => e.documentType === 'BANK_STATEMENT');

    if (bankExtraction?.extractedData?.bankData) {
      const bankData = bankExtraction.extractedData.bankData;
      bankStatementScore = 10; // Base for having bank data
      
      // Check for bounced transactions
      if (bankData.bounceCount > 0) {
        bankStatementScore -= 10;
        factors.push({
          factor: 'Bounced Transactions',
          impact: -10,
          details: `${bankData.bounceCount} bounced transactions detected`
        });
      } else {
        bankStatementScore += 5;
        factors.push({
          factor: 'Clean Banking Track Record',
          impact: 5,
          details: 'No bounced transactions'
        });
      }

      // Check average balance
      if (bankData.averageBalance && application.loanAmount) {
        const avgBalanceRatio = bankData.averageBalance / application.loanAmount;
        if (avgBalanceRatio >= 0.1) {
          bankStatementScore += 5;
          factors.push({
            factor: 'Healthy Cash Balances',
            impact: 5,
            details: 'Average balance above 10% of loan amount'
          });
        }
      }
    }

    score += financialRatioScore + gstAnalysisScore + bankStatementScore;

    // Primary input adjustments
    if (application.primaryInput?.capacityUtilization) {
      const utilization = application.primaryInput.capacityUtilization;
      if (utilization >= 70 && utilization <= 90) {
        score += 5;
        factors.push({
          factor: 'Optimal Capacity Utilization',
          impact: 5,
          details: `Capacity utilization: ${utilization}%`
        });
      } else if (utilization < 50) {
        score -= 5;
        factors.push({
          factor: 'Low Capacity Utilization',
          impact: -5,
          details: `Capacity utilization: ${utilization}%`
        });
      }
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      factors,
      financialRatioScore,
      gstAnalysisScore,
      bankStatementScore,
      baseScore: 70
    };
  }

  /**
   * Calculate Capital Score
   * Based on: Net worth, equity contribution, leverage
   */
  async calculateCapitalScore(application, extractions) {
    let score = 70;
    const factors = [];

    const financialExtraction = extractions.find(e => e.documentType === 'BALANCE_SHEET');

    if (financialExtraction?.extractedData?.financials) {
      const financials = financialExtraction.extractedData.financials;

      // Net worth assessment
      if (financials.netWorth && application.loanAmount) {
        const netWorthToLoan = financials.netWorth / application.loanAmount;
        
        if (netWorthToLoan >= 2) {
          score += 15;
          factors.push({
            factor: 'Strong Net Worth',
            impact: 15,
            details: `Net worth is ${netWorthToLoan.toFixed(1)}x loan amount`
          });
        } else if (netWorthToLoan >= 1) {
          score += 5;
          factors.push({
            factor: 'Adequate Net Worth',
            impact: 5,
            details: `Net worth covers loan amount`
          });
        } else {
          score -= 10;
          factors.push({
            factor: 'Weak Capital Base',
            impact: -10,
            details: `Net worth below loan amount`
          });
        }
      }

      // Tangible net worth
      if (financials.totalAssets && financials.totalLiabilities) {
        const tangibleNetWorth = financials.totalAssets - financials.totalLiabilities;
        if (tangibleNetWorth > 0) {
          score += 5;
        } else {
          score -= 15;
          factors.push({
            factor: 'Negative Net Worth',
            impact: -15,
            details: 'Liabilities exceed assets'
          });
        }
      }
    }

    // Check promoter credentials
    if (application.primaryInput?.promoterCredibility) {
      const credibility = application.primaryInput.promoterCredibility;
      const adjustment = (credibility - 5) * 2;
      score += adjustment;
      factors.push({
        factor: 'Promoter Credibility',
        impact: adjustment,
        details: `Promoter credibility rating: ${credibility}/10`
      });
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      factors,
      baseScore: 70
    };
  }

  /**
   * Calculate Collateral Score
   * Based on: Security coverage, asset quality
   */
  async calculateCollateralScore(application) {
    let score = 60; // Lower base as collateral info may be limited
    const factors = [];

    // This would be enhanced with actual collateral data
    // For now, using a basic assessment

    if (application.primaryInput?.infrastructureRating) {
      const rating = application.primaryInput.infrastructureRating;
      const adjustment = (rating - 5) * 2;
      score += adjustment;
      factors.push({
        factor: 'Infrastructure Assessment',
        impact: adjustment,
        details: `Infrastructure rating: ${rating}/10`
      });
    }

    // Company scale consideration
    if (application.company?.scale) {
      const scale = application.company.scale;
      if (scale === 'LARGE_CORPORATE') {
        score += 10;
        factors.push({
          factor: 'Large Corporate',
          impact: 10,
          details: 'Large corporate with presumably strong asset base'
        });
      } else if (scale === 'SME') {
        score += 0;
        factors.push({
          factor: 'SME',
          impact: 0,
          details: 'SME segment - standard collateral assessment'
        });
      }
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      factors,
      baseScore: 60
    };
  }

  /**
   * Calculate Conditions Score
   * Based on: Sector conditions, market position, business environment
   */
  async calculateConditionsScore(application, intelligence) {
    let score = 70;
    const factors = [];
    let sectorRiskImpact = 0;

    // Sector-based scoring
    const sectorRisks = {
      'IT_SERVICES': { risk: 'LOW', score: 10 },
      'MANUFACTURING': { risk: 'MEDIUM', score: 5 },
      'RETAIL': { risk: 'MEDIUM', score: 5 },
      'HEALTHCARE': { risk: 'LOW', score: 8 },
      'REAL_ESTATE': { risk: 'HIGH', score: -5 },
      'AGRICULTURE': { risk: 'HIGH', score: -5 },
      'LOGISTICS': { risk: 'MEDIUM', score: 3 }
    };

    const sector = application.company?.sector;
    if (sector && sectorRisks[sector]) {
      const sectorScore = sectorRisks[sector].score;
      sectorRiskImpact = sectorScore;
      score += sectorScore;
      factors.push({
        factor: 'Sector Risk Profile',
        impact: sectorScore,
        details: `${sector} sector - ${sectorRisks[sector].risk} risk`
      });
    }

    // Regulatory environment from intelligence
    const regulatoryNews = intelligence.filter(i => 
      i.riskCategories?.includes('REGULATORY')
    );

    if (regulatoryNews.length > 0) {
      const negativeRegulatory = regulatoryNews.filter(i => 
        i.sentiment?.category === 'NEGATIVE'
      );
      
      if (negativeRegulatory.length > 0) {
        score -= 5;
        factors.push({
          factor: 'Regulatory Concerns',
          impact: -5,
          details: `${negativeRegulatory.length} negative regulatory updates`
        });
      }
    }

    // Primary input business assessment
    if (application.primaryInput) {
      if (application.primaryInput.businessProspects) {
        const prospects = application.primaryInput.businessProspects;
        const adjustment = (prospects - 5) * 2;
        score += adjustment;
        factors.push({
          factor: 'Business Prospects',
          impact: adjustment,
          details: `Business prospects rating: ${prospects}/10`
        });
      }
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      factors,
      sectorRiskImpact,
      baseScore: 70
    };
  }

  /**
   * Helper methods
   */
  determineRiskGrade(score) {
    for (const grade of this.riskGrades) {
      if (score >= grade.min) {
        return grade;
      }
    }
    return this.riskGrades[this.riskGrades.length - 1];
  }

  buildFactors(...scores) {
    const positiveFactors = [];
    const negativeFactors = [];

    scores.forEach(scoreObj => {
      if (scoreObj.factors) {
        scoreObj.factors.forEach(factor => {
          if (factor.impact > 0) {
            positiveFactors.push(factor);
          } else if (factor.impact < 0) {
            negativeFactors.push(factor);
          }
        });
      }
    });

    // Sort by absolute impact
    positiveFactors.sort((a, b) => b.impact - a.impact);
    negativeFactors.sort((a, b) => a.impact - b.impact);

    return { positiveFactors, negativeFactors };
  }

  async getActiveWeights() {
    try {
      const model = await this.prisma.scoringModel.findFirst({
        where: { isActive: true }
      });

      if (model?.weights) {
        return model.weights;
      }
    } catch (error) {
      // Use defaults
    }

    return this.defaultWeights;
  }

  generateSensitivityAnalysis(baseScore, weights) {
    return [
      {
        variable: 'Revenue Decline',
        currentValue: 0,
        sensitivity: -2,
        impactExplanation: '10% revenue decline reduces score by 2 points'
      },
      {
        variable: 'Interest Rate Increase',
        currentValue: 0,
        sensitivity: -1,
        impactExplanation: '1% rate increase reduces score by 1 point'
      },
      {
        variable: 'New Litigation',
        currentValue: 0,
        sensitivity: -10,
        impactExplanation: 'Each new litigation reduces score by 10 points'
      }
    ];
  }

  getRecommendation(score) {
    if (score >= 65) return 'APPROVE';
    if (score >= 55) return 'APPROVE_WITH_CONDITIONS';
    if (score >= 45) return 'REVIEW_REQUIRED';
    return 'REJECT';
  }

  calculateConfidence(score, dataPoints) {
    let confidence = 70;
    
    // More data points = higher confidence
    confidence += Math.min(dataPoints * 3, 15);
    
    // Extreme scores have higher confidence
    if (score >= 80 || score < 45) {
      confidence += 10;
    }

    return Math.min(confidence, 95);
  }

  identifyMitigants(negativeFactors) {
    const mitigants = [];
    
    negativeFactors.forEach(factor => {
      if (factor.factor === 'High Leverage') {
        mitigants.push('Consider additional collateral or guarantee');
      }
      if (factor.factor === 'Weak Liquidity') {
        mitigants.push('Structured disbursement based on working capital cycle');
      }
      if (factor.factor === 'Active Litigation') {
        mitigants.push('Monitor litigation progress quarterly');
      }
    });

    return mitigants.slice(0, 3);
  }

  calculateRecommendedAmount(application, score) {
    const baseAmount = application.loanAmount;
    
    if (score >= 75) {
      return baseAmount;
    } else if (score >= 65) {
      return baseAmount * 0.9;
    } else if (score >= 55) {
      return baseAmount * 0.75;
    } else {
      return baseAmount * 0.5;
    }
  }

  calculateRiskPremium(score) {
    if (score >= 80) return 0;
    if (score >= 70) return 0.5;
    if (score >= 60) return 1.0;
    if (score >= 50) return 1.5;
    return 2.5;
  }

  getYearsDifference(startDate, endDate) {
    const diffTime = Math.abs(endDate - startDate);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
  }

  async saveExplanation(applicationId, scoreId, explanationData) {
    try {
      const { Explanation } = this.mongoModels;

      const explanation = new Explanation({
        _id: uuidv4(),
        applicationId,
        scoreId,
        scoreBreakdown: explanationData.fiveCs,
        recommendationLogic: explanationData.recommendationLogic,
        sensitivityAnalysis: []
      });

      await explanation.save();
    } catch (error) {
      logger.error('Error saving explanation:', error);
    }
  }

  /**
   * Get score history for an application
   */
  async getScoreHistory(applicationId) {
    if (!this.prisma) this.init();

    return await this.prisma.creditScore.findMany({
      where: { applicationId },
      orderBy: { calculatedAt: 'desc' }
    });
  }

  /**
   * Get detailed score explanation
   */
  async getScoreExplanation(applicationId, scoreId) {
    if (!this.prisma) this.init();

    const { Explanation } = this.mongoModels;
    return await Explanation.findOne({ applicationId, scoreId });
  }
}

module.exports = new ScoringService();