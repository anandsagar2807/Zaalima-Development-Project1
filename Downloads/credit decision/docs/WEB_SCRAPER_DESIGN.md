# Web Scraper Architecture & Design

## Overview
Multi-source intelligent web scraper for credit risk assessment, designed for Indian corporate ecosystem with legal compliance and data accuracy.

## 1. Architecture Components

```
┌─────────────────────────────────────────────────────────┐
│                    Scraping Orchestrator                │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────┐  │
│  │ Job Queue   │  │ Rate Limiter│  │ Proxy Manager  │  │
│  │ (Bull/Redis)│  │             │  │ (Residential)  │  │
│  └─────────────┘  └─────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
┌──────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐
│   Scraper  │ │ Scraper   │ │  Scraper  │
│   Cluster  │ │ Cluster   │ │  Cluster  │
│   (MCA)    │ │(e-Courts) │ │  (RBI)    │
└────────────┘ └───────────┘ └───────────┘
        │           │              │
        └───────────┼──────────────┘
                    │
┌───────────────────▼─────────────────────┐
│          Data Processing Pipeline        │
│  ┌─────────────┐  ┌──────────────────┐  │
│  │ NER Engine  │  │ Sentiment Anal   │  │
│  │(Company,    │  │ (News/Reports)   │  │
│  │ Person,     │  │                  │  │
│  │ Location)   │  │                  │  │
│  └─────────────┘  └──────────────────┘  │
└──────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────┐
│         Risk Classification Layer        │
│  ┌─────────────────────────────────────┐│
│  │ High Risk Flag Detector             ││
│  │ - Litigation Alerts                 ││
│  │ - Disqualification Detection        ││
│  │ - Default Warnings                  ││
│  │ - Fraud Alerts                      ││
│  └─────────────────────────────────────┘│
└──────────────────────────────────────────┘
```

## 2. Scraping Modules

### A. MCA (Ministry of Corporate Affairs) Scraper
```typescript
interface MCAScraperConfig {
  baseUrl: string;
  rateLimit: number; // requests per minute
  timeout: number;
  useProxy: boolean;
}

class MCAScraper {
  async scrapeCompanyData(CIN: string): Promise<MCACompanyData> {
    const tasks = [
      this.fetchMasterData(CIN),
      this.fetchDirectors(CIN),
      this.fetchCharges(CIN),
      this.fetchFilings(CIN),
      this.fetchAnnualReturns(CIN)
    ];
    
    return Promise.allSettled(tasks);
  }
  
  async fetchDirectors(CIN: string): Promise<DirectorInfo[]> {
    const url = `https://www.mca.gov.in/mcafoportal/showCompanyMasterData.do`;
    
    const response = await this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify({ companyId: CIN }),
      headers: {
        'User-Agent': 'Mozilla/5.0...',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    return this.parseDirectorData(response.html);
  }
  
  detectDirectorDisqualifications(directors: DirectorInfo[]): RiskFlag[] {
    const flags = [];
    
    for (const director of directors) {
      if (director.status === 'Disqualified') {
        flags.push({
          type: 'DIRECTOR_DISQUALIFICATION',
          severity: 'HIGH',
          entity: director.name,
          din: director.din,
          reason: director.disqualificationReason,
          date: director.disqualificationDate
        });
      }
      
      // Check for DIN deactivation
      if (director.dinStatus === 'Deactivated') {
        flags.push({
          type: 'DIN_DEACTIVATION',
          severity: 'HIGH',
          entity: director.name,
          details: 'Director DIN deactivated'
        });
      }
    }
    
    return flags;
  }
}
```

### B. e-Courts Litigation Scraper
```typescript
class eCourtsScraper {
  private courts = [
    'https://services.ecourts.gov.in/ecourtindia/',
    // State-specific endpoints
  ];
  
  async searchLitigation(companyPAN: string, companyName: string): Promise<LitigationData[]> {
    const litigations = [];
    
    for (const court of this.courts) {
      const cases = await this.searchCourt(court, {
        petitioner: companyName,
        respondent: companyName,
        caseType: 'Commercial'
      });
      
      litigations.push(...cases);
      
      // Respect rate limits
      await this.delay(2000);
    }
    
    return this.deduplicate(litigations);
  }
  
  parseCaseStatus(caseStatus: string): { severity: string, stage: string } {
    const statusMap = {
      'DISPOSED': { severity: 'LOW', stage: 'CLOSED' },
      'FIRST HEARING': { severity: 'MEDIUM', stage: 'INITIAL' },
      'ADJOURNED': { severity: 'MEDIUM', stage: 'ONGOING' },
      'EXECUTION': { severity: 'HIGH', stage: 'ENFORCEMENT' },
      'DECREED': { severity: 'HIGH', stage: 'JUDGMENT' },
      'BANKRUPTCY': { severity: 'CRITICAL', stage: 'INSOLVENCY' }
    };
    
    return statusMap[caseStatus] || { severity: 'MEDIUM', stage: 'UNKNOWN' };
  }
  
  calculateLitigationImpact(litigations: LitigationData[]): number {
    let impactScore = 0;
    
    for (const case of litigations) {
      const baseImpact = {
        'RECOVERY_SUIT': 30,
        'CHEQUE_BOUNCE': 25,
        'INSOLVENCY': 100,
        'TAX_DISPUTE': 40,
        'CONTRACT_DISPUTE': 20,
        'LABOUR_DISPUTE': 15
      }[case.type] || 10;
      
      const statusMultiplier = {
        'DISPOSED': 0.1,
        'FIRST_HEARING': 1.0,
        'ADJOURNED': 1.2,
        'EXECUTION': 1.5,
        'DECREED': 1.3,
        'BANKRUPTCY': 2.0
      }[case.status] || 1.0;
      
      const amountMultiplier = Math.min(2.0, Math.log10(case.claimAmount / 1000000));
      
      impactScore += baseImpact * statusMultiplier * Math.max(1, amountMultiplier);
    }
    
    return Math.min(100, impactScore);
  }
}
```

### C. News & Media Intelligence
```typescript
class NewsIntelligenceScraper {
  private sources = [
    'https://economictimes.indiatimes.com/',
    'https://www.business-standard.com/',
    'https://www.moneycontrol.com/',
    'https://www.livemint.com/'
  ];
  
  async gatherSentimentData(companyName: string, directors: string[]): Promise<SentimentData[]> {
    const sentimentResults = [];
    
    for (const source of this.sources) {
      const articles = await this.searchArchive(source, companyName);
      
      for (const article of articles) {
        const sentiment = await this.analyzeSentiment(article.content);
        const entities = await this.extractEntities(article.content);
        
        sentimentResults.push({
          source: source,
          url: article.url,
          title: article.headline,
          publishedDate: article.date,
          sentiment: sentiment,
          entities: entities,
          riskIndicators: this.detectRiskFlags(article.content)
        });
      }
    }
    
    return sentimentResults;
  }
  
  analyzeSentiment(text: string): { polarity: number, category: string } {
    // Use ML sentiment analysis model
    const positiveWords = ['growth', 'profit', 'expansion', 'success', 'improvement'];
    const negativeWords = ['default', 'loss', 'fraud', 'litigation', 'decline', 'bankruptcy'];
    
    const normalizedText = text.toLowerCase();
    const positiveScore = positiveWords.filter(w => normalizedText.includes(w)).length;
    const negativeScore = negativeWords.filter(w => normalizedText.includes(w)).length;
    
    const polarity = (positiveScore - negativeScore) / (positiveScore + negativeScore + 1);
    
    return {
      polarity: polarity,
      category: polarity > 0.2 ? 'POSITIVE' : polarity < -0.2 ? 'NEGATIVE' : 'NEUTRAL'
    };
  }
  
  detectRiskFlags(text: string): RiskIndicator[] {
    const flags = [];
    
    const riskPatterns = {
      'REGULATORY_ACTION': /(SEBI|RBI|MCA)\s+(penalty|action|warning|fine|ban)/gi,
      'AUDIT_QUALIFICATION': /(auditors?\s+(qualified|adverse|disclaimer))/gi,
      'FRAUD_ALLEGATION': /(fraud|scam|embezzlement|misappropriation)/gi,
      'DEFAULT_WARNING': /(default\s+(on|in)|loan\s+default|payment\s+default)/gi,
      'MANAGEMENT_EXIT': /(CEO|CFO|director|promoter)\s+(resign|exit|quit|leave)/gi
    };
    
    for (const [flagType, pattern] of Object.entries(riskPatterns)) {
      if (pattern.test(text)) {
        flags.push({ type: flagType });
      }
    }
    
    return flags;
  }
}
```

## 3. Research Agent Implementation

```typescript
class ResearchAgent {
  constructor(
    private mcaScraper: MCAScraper,
    private litigationScraper: eCourtsScraper,
    private newsScraper: NewsIntelligenceScraper,
    private rbiMonitor: RBIRegulationScraper
  ) {}
  
  async conductComprehensiveResearch(applicationId: string): Promise<ResearchReport> {
    console.log(`Starting research for application ${applicationId}`);
    
    // Get company details
    const application = await this.getApplication(applicationId);
    const company = application.company;
    
    // Parallel execution for efficiency
    const researchTasks = [
      this.investigateMCA(company),
      this.checkLitigation(company),
      this.gatherNewsIntelligence(company),
      this.monitorRBIRegulations(company),
      this.searchRatingAgencies(company)
    ];
    
    const results = await Promise.allSettled(researchTasks);
    
    return this.compileResearchReport(results, application);
  }
  
  private async investigateMCA(company: Company): Promise<MCAIntelligence> {
    const mcaData = await this.mcaScraper.scrapeCompanyData(company.cin);
    
    return {
      companyStatus: mcaData.status,
      incorporationDate: mcaData.incorporationDate,
      directors: mcaData.directors,
      charges: mcaData.charges,
      annualReturns: mcaData.annualReturns,
      disqualifications: this.mcaScraper.detectDirectorDisqualifications(mcaData.directors),
      filingCompliance: this.analyzeFilingCompliance(mcaData),
      riskFlags: this.generateMCAFlags(mcaData)
    };
  }
  
  private analyzeFilingCompliance(mcaData: MCAData): FilingComplianceReport {
    const adtReturns = mcaData.filings.filter(f => f.type === 'ADT-4');
    const aocReturns = mcaData.filings.filter(f => f.type === 'AOC-4');
    const mcaReturns = mcaData.filings.filter(f => f.type === 'MGT-7');
    
    const lateFilingPenalty = this.calculateLateFilingPenalty(adtReturns, aocReturns, mcaReturns);
    
    return {
      lateFilingCount: lateFilingPenalty.count,
      complianceScore: Math.max(0, 100 - lateFilingPenalty.score),
      lastFilingDate: mcaData.lastFilingDate,
      pendingReturns: mcaData.pendingReturns
    };
  }
  
  private generateMCAFlags(mcaData: MCAData): RiskFlag[] {
    const flags = [];
    
    if (mcaData.status === 'Active - Default in Filing') {
      flags.push({
        type: 'FILING_DEFAULT',
        severity: 'HIGH',
        description: 'Company defaulted in statutory filings'
      });
    }
    
    if (mcaData.charges.some(c => c.status === 'Satisfied')) {
      flags.push({
        type: 'SATISFIED_CHARGES',
        severity: 'MEDIUM',
        description: 'Company has satisfied charges - check for loan repayments'
      });
    }
    
    return flags;
  }
  
  private async monitorRBIRegulations(company: Company): Promise<RBIIntelligence> {
    const regulations = await this.rbiMonitor.getSectorRegulations(company.sector);
    const circulars = await this.rbiMonitor.getRecentCirculars();
    
    return {
      sectorRegulations: regulations,
      recentCirculars: circulars,
      complianceRequirements: this.identifyComplianceRequirements(company, regulations),
      riskAlerts: this.generateRBIAlerts(company, circulars)
    };
  }
}

// Risk Classification Module
class RiskClassifier {
  classifyResearchFindings(research: ResearchReport): RiskClassification {
    const scores = {
      financial: 0,
      operational: 0,
      legal: 0,
      regulatory: 0,
      reputational: 0
    };
    
    // Analyze MCA findings
    if (research.mcaData.disqualifications.length > 0) {
      scores.legal += 30 * research.mcaData.disqualifications.length;
      scores.reputational += 20;
    }
    
    // Analyze litigation impact
    const litigationImpact = research.litigationData.reduce(
      (sum, lit) => sum + lit.impactScore, 0
    );
    scores.legal += litigationImpact;
    
    // Analyze news sentiment
    const negativeNews = research.newsData.filter(n => n.sentiment.category === 'NEGATIVE');
    if (negativeNews.length > 3) {
      scores.reputational += 25;
    }
    
    // Analyze sector regulations
    if (research.rbiData.sectorRegulations.some(r => r.type === 'RESTRICTIVE')) {
      scores.regulatory += 20;
    }
    
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    
    return {
      overallRisk: this.categorizeRisk(totalScore),
      categoryScores: scores,
      keyConcerns: this.extractKeyConcerns(research),
      recommendations: this.generateRecommendations(research, scores)
    };
  }
  
  private categorizeRisk(score: number): string {
    if (score >= 100) return 'CRITICAL';
    if (score >= 70) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    if (score >= 20) return 'LOW';
    return 'MINIMAL';
  }
}
```

## 4. Proxy & Rate Limiting Strategy

```typescript
class ProxyRotationManager {
  private proxies: Proxy[] = [];
  private currentIndex = 0;
  
  getNextProxy(): Proxy {
    const proxy = this.proxies[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
    return proxy;
  }
  
  async validateProxy(proxy: Proxy): Promise<boolean> {
    try {
      const response = await fetch('https://httpbin.org/ip', {
        proxy: proxy.url
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
  
  blacklistProxy(proxy: Proxy, reason: string): void {
    proxy.blacklisted = true;
    proxy.blacklistReason = reason;
    console.warn(`Proxy blacklisted: ${proxy.url} - ${reason}`);
  }
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequestsPerMinute: number = 30,
    private maxRequestsPerHour: number = 500
  ) {}
  
  async acquirePermission(source: string): Promise<boolean> {
    const now = Date.now();
    const minuteAgo = now - 60000;
    const hourAgo = now - 3600000;
    
    if (!this.requests.has(source)) {
      this.requests.set(source, []);
    }
    
    const sourceRequests = this.requests.get(source)!;
    
    // Remove old requests
    const validRequests = sourceRequests.filter(req => req > now - 3600000);
    this.requests.set(source, validRequests);
    
    // Check limits
    const minuteRequests = validRequests.filter(req => req > minuteAgo).length;
    const hourRequests = validRequests.length;
    
    if (minuteRequests >= this.maxRequestsPerMinute || hourRequests >= this.maxRequestsPerHour) {
      return false;
    }
    
    sourceRequests.push(now);
    return true;
  }
  
  async waitIfNeeded(source: string): Promise<void> {
    while (!await this.acquirePermission(source)) {
      await this.delay(1000);
    }
  }
}
```

## 5. Error Handling & Monitoring

```typescript
class ScrapingErrorHandler {
  private errorThreshold = 5;
  
  async handleError(error: Error, source: string, taskId: string): Promise<void> {
    console.error(`Scraping error for ${source}: ${taskId}`, error);
    
    await this.logError({
      source,
      taskId,
      errorMessage: error.message,
      stackTrace: error.stack,
      timestamp: new Date()
    });
    
    // Implement circuit breaker pattern
    if (this.getErrorCount(source) > this.errorThreshold) {
      await this.disableScraper(source, 'High error rate');
    }
  }
  
  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
        console.log(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms`);
        await this.delay(delay);
      }
    }
    
    throw lastError!;
  }
}
```

This web scraper architecture ensures comprehensive data collection while maintaining legal compliance and system reliability.