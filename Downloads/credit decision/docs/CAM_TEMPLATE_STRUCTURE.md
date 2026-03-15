# Credit Appraisal Memo (CAM) Template Structure

## Document Template Overview
Professional Credit Appraisal Memo with structured sections, smart data binding, and dynamic content generation.

## 1. DOCX Template Structure

### Header Section
```
┌─────────────────────────────────────────────────────────────┐
│                    CREDIT APPRAISAL MEMO                    │
│                                                            │
│  Application ID:  #{application.applicationNumber}         │
│  Company Name:    #{company.name}                          │
│  Loan Amount:     ₹#{formatCurrency(application.loanAmount)}│
│  Assessment Date: #{formatDate(cam.generatedAt)}           │
│                                                            │
│  Risk Grade:      #{score.riskGrade}                       │
│  Credit Officer:  #{user.name}                             │
│  Status:          #{application.status}                    │
└─────────────────────────────────────────────────────────────┘
```

## 2. Main Sections with Data Binding

### EXECUTIVE SUMMARY
```markdown
## 1. EXECUTIVE SUMMARY

### Recommendation
#{cam.recommendation.type} - #{cam.recommendation.decision}
- Proposed Loan Amount: ₹#{formatCurrency(cam.recommendation.amount)}
- Tenor: #{application.tenorMonths} months
- Risk-Adjusted Rate: #{formatPercentage(cam.recommendation.rate)}%
- Risk Grade: #{score.riskGrade}

### Business Overview
Company: #{company.name}
Constitution: #{company.businessType}
Incorporation Date: #{formatDate(company.incorporationDate)}
Sector: #{company.sector}
PAN: #{maskPAN(company.pan)}
GSTIN: #{company.gstin}
CIBIL Commercial Score: #{company.cibilScore}

### Financial Highlights (Latest Year)
| Metric                 | Amount (₹ Cr) | % Change |
|------------------------|---------------|----------|
| Turnover               | #{financial.turnover} | #{financial.turnoverGrowth}% |
| EBITDA                 | #{financial.ebitda} | #{financial.ebitdaGrowth}% |
| Net Profit             | #{financial.netProfit} | #{financial.netProfitGrowth}% |
| Net Worth              | #{financial.netWorth} | #{financial.netWorthGrowth}% |
| Total Debt             | #{financial.totalDebt} | #{financial.totalDebtChange}% |

### Key Risk Factors
#{each cam.riskFactors as risk}
• #{risk.severity}: #{risk.description}
#{end}

### Key Strengths
#{each cam.strengths as strength}
• #{strength.category}: #{strength.description}
#{end}
```

### INDUSTRY ANALYSIS
```markdown
## 2. INDUSTRY & BUSINESS ANALYSIS

### Sector Overview
Sector: #{company.sector}
Current Outlook: #{sector.outlook}
Growth Prospects: #{sector.growthProspects}
Regulatory Environment: #{sector.regulatoryEnvironment}

### Market Position
Company Ranking: #{business.positionInSector}
Market Share: #{formatPercentage(business.marketShare)}%
Competitive Advantage: #{business.competitiveAdvantage}
Bargaining Power: #{business.bargainingPower}

### Sector Risk Assessment
Overall Sector Risk: #{sector.riskLevel}
Key Risks:
#{each sector.risks as risk}
• #{risk.type}: #{risk.description} (Impact: #{risk.impact})
#{end}

### Regulatory Compliance
#{each sector.regulations as regulation}
• #{regulation.name}: #{regulation.status} 
  Compliance Date: #{formatDate(regulation.complianceDate)}
#{end}
```

### FINANCIAL ANALYSIS
```markdown
## 3. FINANCIAL ANALYSIS

### Financial Performance (3-Year Trend)
| Year | Turnover | EBITDA | PAT | Net Worth | Total Debt |
|------|----------|--------|-----|-----------|------------|
#{each financial.historicalData as year}
| #{year.year} | ₹#{formatAmount(year.turnover)} | ₹#{formatAmount(year.ebitda)} | ₹#{formatAmount(year.pat)} | ₹#{formatAmount(year.netWorth)} | ₹#{formatAmount(year.totalDebt)} |
#{end}

### Key Financial Ratios
| Ratio                 | Current | Previous | Industry Avg | Assessment |
|-----------------------|---------|----------|--------------|------------|
| Current Ratio         | #{ratios.currentRatio} | #{ratios.currentRatioPrev} | #{ratios.currentRatioIndustry} | #{getAssessment(ratios.currentRatio)} |
| Debt-Equity Ratio     | #{ratios.debtEquity} | #{ratios.debtEquityPrev} | #{ratios.debtEquityIndustry} | #{getAssessment(ratios.debtEquity)} |
| Interest Coverage     | #{ratios.interestCoverage} | #{ratios.interestCoveragePrev} | #{ratios.interestCoverageIndustry} | #{getAssessment(ratios.interestCoverage)} |
| Return on Capital     | #{ratios.roc}% | #{ratios.rocPrev}% | #{ratios.rocIndustry}% | #{getAssessment(ratios.roc)} |
| Net Profit Margin     | #{ratios.netMargin}% | #{ratios.netMarginPrev}% | #{ratios.netMarginIndustry}% | #{getAssessment(ratios.netMargin)} |

### Cash Flow Analysis
| Metric                | Current Year | Previous Year |
|-----------------------|--------------|---------------|
| Operating Cash Flow   | ₹#{cashflow.operating} | ₹#{cashflow.operatingPrev} |
| Investing Cash Flow   | ₹#{cashflow.investing} | ₹#{cashflow.investingPrev} |
| Financing Cash Flow   | ₹#{cashflow.financing} | ₹#{cashflow.financingPrev} |
| Net Cash Flow         | ₹#{cashflow.net} | ₹#{cashflow.netPrev} |

### Working Capital Analysis
Average Working Capital: ₹#{formatAmount(financial.workingCapital)}
Working Capital Cycle: #{financial.workingCapitalCycle} days
Inventory Days: #{financial.inventoryDays} days
Receivable Days: #{financial.receivableDays} days
Payable Days: #{financial.payableDays} days
```

### GST & TAX ANALYSIS
```markdown
## 4. GST COMPLIANCE & RECONCILIATION

### GST Filing Status
GSTIN: #{company.gstin}
Last Filing Period: #{gst.lastFilingPeriod}
Filing Frequency: #{gst.filingFrequency}
Compliance Score: #{gst.complianceScore}/100

### GST Reconciliation Analysis
| Metric                     | GSTR-1/Turnover | GSTR-3B (Tax) | GSTR-2A (Purchase) | Variance |
|---------------------------|----------------|--------------|-------------------|----------|
| Annual Turnover           | ₹#{gst.gstr1Turnover} | -           | -                 | - |
| Tax Payments              | -             | ₹#{gst.gstr3bTax} | -               | - |
| Input Tax Credit          | -             | -           | ₹#{gst.gstr2aPurchase} | - |
| Turnover Mismatch         | #{gst.turnoverVariance}% | - | - | #{getRiskLevel(gst.turnoverVariance)} |
| Tax Payment Variance      | -             | #{gst.taxPaymentVariance}% | - | #{getRiskLevel(gst.taxPaymentVariance)} |

### GST Risk Assessment
Status: #{gst.riskAssessment.status}
Key Concerns:
#{each gst.riskFlags as flag}
• #{flag.type}: #{flag.description}
  Severity: #{flag.severity}
#{end}

### Tax Compliance
ITR Filing Status: #{tax.itrStatus}
Last Assessment Year: #{tax.lastAssessmentYear}
Tax Disputes: #{tax.disputeCount} cases
Total Disputed Amount: ₹#{formatAmount(tax.totalDisputedAmount)}
```

### LITIGATION & LEGAL ANALYSIS
```markdown
## 5. LITIGATION & LEGAL ANALYSIS

### Litigation Summary
Total Active Cases: #{litigation.totalCount}
High Severity Cases: #{litigation.highSeverityCount}
Total Claim Amount: ₹#{formatAmount(litigation.totalClaimAmount)}
Weighted Risk Score: #{litigation.riskScore}/100

### Critical Litigations
#{each litigation.criticalCases as case}
**#{case.caseNumber}** - #{case.caseType}
Court: #{case.court}
Status: #{case.status}
Claim Amount: ₹#{formatAmount(case.claimAmount)}
Filing Date: #{formatDate(case.filingDate)}
Last Hearing: #{formatDate(case.lastHearing)}
Impact Assessment:
#{case.impactAssessment}
Risk Level: #{case.severity}

#{end}

### Director Disqualifications
#{if litigation.directorDisqualifications.length > 0}
**WARNING**: Director Disqualifications Detected
#{each litigation.directorDisqualifications as disqualification}
• #{disqualification.directorName} (DIN: #{disqualification.din})
  Reason: #{disqualification.reason}
  Date: #{formatDate(disqualification.disqualificationDate)}
#{end}
#{else}
No Director Disqualifications - Clean Record
#{end}

### Arbitration & Disputes
Active Disputes: #{litigation.arbitrationCount}
Settlement Discussions: #{litigation.settlementCount}
ICD/Debenture Defaults: #{litigation.defaultCount}
```

### PRIMARY ASSESSMENT
```markdown
## 6. PRIMARY ASSESSMENT (CREDIT OFFICER INPUT)

### Site Visit Details
Visit Date: #{formatDate(primary.siteVisitDate)}
Capacity Utilization: #{formatPercentage(primary.capacityUtilization)}%
Inventory Quality: #{primary.inventoryQuality}
Employee Morale: #{primary.employeeMorale}
Infrastructure: #{primary.infrastructure}
Overall Impression: #{primary.overallImpression}

### Management Assessment
Management Experience: #{primary.managementExperience} years
Management Quality Rating: #{primary.managementQuality}/10
Promoter Credibility Rating: #{primary.promoterCredibility}/10
Succession Planning: #{primary.successionPlanning}
Key Management Personnel:
#{each primary.keyPersonnel as person}
• #{person.name} - #{person.designation}: #{person.experience} years
#{end}

### Key Observations
Strengths: #{primary.strengths}
Concerns: #{primary.concerns}
Risk Observed: #{primary.risks}
Mitigation Factors: #{primary.mitigations}

### Score Adjustments
Base Score: #{score.baseScore}
Primary Input Adjustment: #{primary.scoreAdjustment}
Justification: #{primary.adjustmentReason}
Final Score: #{score.finalScore}
```

### RISK ASSESSMENT
```markdown
## 7. RISK ASSESSMENT & MITIGATION

### Five Cs Framework Score
| C-Factor          | Score (0-100) | Weight | Weighted Score | Assessment |
|-------------------|---------------|--------|----------------|------------|
| Character         | #{5c.character.score} | 25% | #{5c.character.weighted} | #{assessRisk(5c.character.score)} |
| Capacity          | #{5c.capacity.score} | 30% | #{5c.capacity.weighted} | #{assessRisk(5c.capacity.score)} |
| Capital           | #{5c.capital.score} | 20% | #{5c.capital.weighted} | #{assessRisk(5c.capital.score)} |
| Collateral        | #{5c.collateral.score} | 15% | #{5c.collateral.weighted} | #{assessRisk(5c.collateral.score)} |
| Conditions        | #{5c.conditions.score} | 10% | #{5c.conditions.weighted} | #{assessRisk(5c.conditions.score)} |
|                   |              | **TOTAL** | **#{score.finalScore}** | **#{score.riskGrade}** |

### Key Risk Indicators
#{each risk.indicators as indicator}
**#{indicator.category}**
• #{indicator.description}
  Current Value: #{indicator.currentValue}
  Benchmark: #{indicator.benchmark}
  Risk Level: #{indicator.severity}
  Impact on Score: #{indicator.impact}
#{end}

### Mitigation Measures
#{each risk.mitigations as mitigation}
• #{mitigation.measure}: #{mitigation.description}
  Expected Impact: #{mitigation.expectedImpact}
  Monitoring Required: #{mitigation.monitoring}
#{end}

### Sensitivity Analysis
Critical Variables:
#{each risk.sensitivity as variable}
• #{variable.name}: #{variable.currentValue}
  +10% Impact: #{variable.positiveImpact}
  -10% Impact: #{variable.negativeImpact}
#{end}
```

### RECOMMENDATION
```markdown
## 8. RECOMMENDATION & APPROVAL

### Credit Recommendation
Decision: **#{cam.recommendation.decision}**

#{if cam.recommendation.decision === 'APPROVE'}
Recommended Loan Amount: ₹#{formatCurrency(cam.recommendation.approvedAmount)}
Sanctioned Amount: ₹#{formatCurrency(cam.recommendation.sanctionedAmount)}
Margin/Contribution: #{formatPercentage(cam.recommendation.margin)}%
Tenor: #{application.tenorMonths} months
Interest Rate: #{formatPercentage(cam.recommendation.interestRate)}% (p.a.)
Repayment Schedule: #{cam.recommendation.repaymentSchedule}
Security Details: #{cam.recommendation.securityDetails}

### Risk-Adjusted Pricing
Base Rate: #{formatPercentage(cam.pricing.baseRate)}% (Repo + Spread)
Risk Premium: #{formatPercentage(cam.pricing.riskPremium)}%
Sector Adjustment: #{formatPercentage(cam.pricing.sectorAdjustment)}%
Tenor Premium: #{formatPercentage(cam.pricing.tenorPremium)}%
**Final Rate**: #{formatPercentage(cam.pricing.finalRate)}% p.a.
#{else}
Rejection Reason: 
#{each cam.rejectionReasons as reason}
• #{reason.category}: #{reason.description}
#{end}

Alternative Options: #{cam.alternatives}
#{end}

### Loan Covenants & Conditions
#{each cam.covenants as covenant}
• #{covenant.type}: #{covenant.description}
  Monitoring: #{covenant.monitoringFrequency}
#{end}

### Approval Authority
Recommendation By: #{user.name} - #{user.designation}
Date: #{formatDate(cam.generatedAt)}

Approved By: ___________________
Designation: ___________________
Date: ___________________
```

## 3. PDF Generation Code Structure

```typescript
class CAMGenerator {
  private templatePath: string;
  
  async generateCAM(applicationId: string): Promise<Buffer> {
    // 1. Fetch all necessary data
    const data = await this.fetchData(applicationId);
    
    // 2. Process template
    const docxBuffer = await this.processTemplate(data);
    
    // 3. Convert to PDF
    const pdfBuffer = await this.convertToPDF(docxBuffer);
    
    // 4. Add digital signature
    const signedPdf = await this.signPDF(pdfBuffer);
    
    return signedPdf;
  }
  
  private async processTemplate(camData: CAMData): Promise<Buffer> {
    const template = fs.readFileSync(this.templatePath);
    
    // Use docxtemplater for smart replacements
    const zip = new PizZip(template);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true
    });
    
    // Render template
    doc.render(camData);
    
    return doc.getZip().generate({ type: 'nodebuffer' });
  }
  
  private async convertToPDF(docxBuffer: Buffer): Promise<Buffer> {
    const libreOfficePath = '/usr/bin/libreoffice';
    
    // Convert using LibreOffice headless mode
    const result = await execPromise(`${libreOfficePath} --headless --convert-to pdf --outdir /tmp/ input.docx`);
    
    return fs.readFileSync('/tmp/input.pdf');
  }
  
  private async fetchData(applicationId: string): Promise<CAMData> {
    // Comprehensive data fetching
    const [application, company, financials, risk, litigation, primary, sector] = await Promise.all([
      this.getApplication(applicationId),
      this.getCompany(application.companyId),
      this.getFinancialData(applicationId),
      this.getRiskData(applicationId),
      this.getLitigationData(applicationId),
      this.getPrimaryInput(applicationId),
      this.getSectorData(company.sector)
    ]);
    
    return {
      application,
      company,
      financial: this.processFinancialData(financials),
      ratios: this.calculateRatios(financials),
      score: risk.score,
      _5c: risk.fiveC,
      litigation: this.processLitigation(litigation),
      gst: risk.gstAnalysis,
      tax: risk.taxAnalysis,
      sector,
      primary: primary || this.getDefaultPrimary(),
      cam: this.generateCAMContent(application, risk, financials),
      risk: this.generateRiskContent(risk),
      user: this.getCurrentUser(),
      helpers: {
        formatCurrency: (value: number) => this.formatCurrency(value),
        formatDate: (date: Date) => this.formatDate(date),
        formatPercentage: (value: number) => this.formatPercentage(value),
        formatAmount: (value: number) => this.formatAmount(value),
        maskPAN: (pan: string) => this.maskPAN(pan),
        getRiskLevel: (variance: number) => this.getRiskLevel(variance),
        getAssessment: (ratio: number) => this.getRatioAssessment(ratio),
        assessRisk: (score: number) => this.assessRisk(score)
      }
    };
  }
}
```

## 4. Dynamic Content Generation

```typescript
class CAMContentGenerator {
  generateRecommendation(score: CreditScore, application: Application): Recommendation {
    const finalScore = score.finalScore;
    
    if (finalScore >= 75) {
      return {
        decision: 'APPROVE',
        approvedAmount: application.loanAmount,
        sanctionedAmount: Math.min(application.loanAmount, score.recommendedAmount),
        interestRate: this.calculateInterestRate(score),
        repaymentSchedule: 'Monthly reducing balance',
        securityDetails: 'Primary security + Collateral as per policy',
        covenants: this.generateCovenants(score)
      };
    } else if (finalScore >= 55) {
      return {
        decision: 'APPROVE_WITH_CONDITIONS',
        approvedAmount: score.recommendedAmount * 0.8, // Reduce by 20%
        sanctionedAmount: score.recommendedAmount * 0.8,
        interestRate: this.calculateInterestRate(score) + 1.5, // Higher premium
        repaymentSchedule: 'Monthly reducing balance',
        securityDetails: 'Enhanced security required',
        covenants: this.generateStrictCovenants(score)
      };
    } else {
      return {
        decision: 'REJECT',
        rejectionReasons: score.negativeFactors.map(f => ({
          category: this.categorizeReason(f.factor),
          description: f.description
        })),
        alternatives: this.generateAlternatives(score)
      };
    }
  }
  
  generateRiskFlags(gstAnalysis: GSTAnalysis, litigation: Litigation[]): RiskFlag[] {
    const flags = [];
    
    // GST Flags
    if (gstAnalysis.turnoverVariance > 20) {
      flags.push({
        severity: 'HIGH',
        type: 'GST_TURNOVER_MISMATCH',
        description: `Significant variance (${gstAnalysis.turnoverVariance}%) between GSTR-1 and bank turnover`
      });
    }
    
    if (gstAnalysis.taxPaymentVariance > 15) {
      flags.push({
        severity: 'MEDIUM',
        type: 'TAX_PAYMENT_MISMATCH',
        description: `Variance in tax payments between GSTR-3B and 2A`
      });
    }
    
    // Litigation Flags
    const highSeverityLitigations = litigation.filter(l => l.severity === 'HIGH' || l.severity === 'CRITICAL');
    if (highSeverityLitigations.length > 0) {
      flags.push({
        severity: 'HIGH',
        type: 'HIGH_STAKE_LITIGATION',
        description: `${highSeverityLitigations.length} high-severity litigation cases pending`
      });
    }
    
    return flags;
  }
}
```

This CAM template structure ensures comprehensive, professional credit assessment documentation with dynamic data integration.