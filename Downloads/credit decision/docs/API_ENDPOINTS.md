# Credit Decisioning Engine API Endpoints

## Base URL: https://api.credit-engine.fintech.com/v1

## Authentication Endpoints
```
POST   /auth/login                    # User login (email/password)
POST   /auth/refresh                  # Refresh JWT token
GET    /auth/profile                  # Get user profile
PUT    /auth/profile                  # Update user profile
```

## Application Management
```
GET    /applications                  # List applications (with filters)
POST   /applications                  # Create new application
GET    /applications/:id              # Get application details
PUT    /applications/:id              # Update application
PUT    /applications/:id/submit       # Submit for review
PUT    /applications/:id/status       # Update status
DELETE /applications/:id              # Delete application

# Quick Status Updates
PUT    /applications/:id/priority     # Set priority (LOW/MEDIUM/HIGH)
PUT    /applications/:id/assign       # Assign to credit officer
```

## Document Upload & Processing
```
POST   /documents/upload              # Upload single/multiple files
GET    /documents/:applicationId      # List documents for application
GET    /documents/:id                 # Get document details
DELETE /documents/:id                 # Delete document
GET    /documents/:id/download        # Download original file
GET    /documents/:id/thumbnail       # Get PDF thumbnail

# Processing Endpoints
POST   /documents/:id/reprocess       # Re-run extraction
GET    /documents/:id/extraction      # Get extracted data
PUT    /documents/:id/validation      # Update validation status
POST   /documents/:id/correction      # Submit manual correction
```

## OCR & Data Extraction API
```
POST   /extract/ocr                   # Trigger OCR processing (async)
GET    /extract/status/:jobId         # Check extraction status
POST   /extract/text-analysis         # NLP analysis of text
POST   /extract/financial-ratios      # Calculate financial ratios
POST   /extract/gst-analysis          # Analyze GST data
GET    /extract/confidence/:id        # Get confidence scores
```

## Credit Scoring Engine
```
POST   /scoring/calculate/:appId      # Calculate risk score
GET    /scoring/score/:appId          # Get current score
POST   /scoring/recalculate/:appId    # Refresh score with new data
GET    /scoring/breakdown/:appId      # Detailed score breakdown
GET    /scoring/explain/:appId        # Explainability report
POST   /scoring/sensitivity/:appId    # Run sensitivity analysis
GET    /scoring/history/:appId        # Score change history
```

## Five Cs Framework
```
GET    /scoring/character/:appId      # Character assessment
GET    /scoring/capacity/:appId       # Capacity to repay
GET    /scoring/capital/:appId        # Capital analysis
GET    /scoring/collateral/:appId     # Collateral assessment
GET    /scoring/conditions/:appId     # Business conditions
```

## Research & Intelligence
```
POST   /research/initiate/:appId      # Start automated research
GET    /research/status/:appId        # Research status
GET    /research/results/:appId       # Research findings
POST   /research/refresh/:appId       # Refresh research data

# Specific Research Endpoints
GET    /research/litigation/:appId    # Litigation tracking
GET    /research/mca/:companyId       # MCA filings
GET    /research/news/:companyId      # News sentiment
GET    /research/regulations          # Latest RBI regulations
```

## Primary Input Management
```
POST   /primary-input/:appId          # Create/save primary input
GET    /primary-input/:appId          # Get primary input
PUT    /primary-input/:appId          # Update primary input
POST   /primary-input/:appId/adjust   # Apply score adjustment

# Site Visit Module
POST   /visits/:appId                 # Log site visit
GET    /visits/:appId                 # Get visit details
POST   /visits/:appId/photos          # Upload visit photos
```

## Risk Analysis
```
GET    /risk/flags/:appId             # List risk flags
POST   /risk/analyze/:appId           # Deep risk analysis
GET    /risk/summary/:appId           # Risk summary report

# Specific Risk Checks
POST   /risk/circular-trading         # Detect circular trading
POST   /risk/gst-reconciliation       # GST-Bank mismatch analysis
GET    /risk/sector/:sector           # Sector risk indicators
POST   /risk/litigation-impact        # Litigation risk assessment
```

## CAM (Credit Appraisal Memo) Generation
```
POST   /cam/generate/:appId           # Generate CAM
GET    /cam/:appId                    # Get CAM data
PUT    /cam/:appId                    # Update CAM content
POST   /cam/:appId/approve            # Approve CAM
POST   /cam/:appId/reject             # Reject CAM

# Export Functions
GET    /cam/:appId/pdf                # Download PDF
GET    /cam/:appId/docx               # Download Word
GET    /cam/:appId/preview            # Preview HTML
```

## Dashboard & Analytics
```
GET    /dashboard/overview            # Executive dashboard
GET    /dashboard/portfolio           # Portfolio analytics
GET    /dashboard/performance         # Team performance
GET    /dashboard/pipeline            # Application pipeline

# Advanced Analytics
GET    /analytics/turnaround-time     # Processing time metrics
GET    /analytics/default-rate        # Default rate analysis
GET    /analytics/score-distribution  # Score distribution
```

## Reports & Exports
```
GET    /reports/applications          # Applications report (CSV/Excel)
GET    /reports/portfolio             # Portfolio health report
GET    /reports/risk-exposure         # Risk exposure analysis
GET    /reports/performance           # Model performance
POST   /reports/custom                # Custom report builder
```

## Business Rules & Configuration
```
GET    /config/scoring-weights        # Get scoring configuration
PUT    /config/scoring-weights        # Update scoring weights
GET    /config/approval-limits        # Approval authority limits
PUT    /config/approval-limits        # Update limits
GET    /config/sector-classification  # Sector categories
```

## Webhooks (External Systems)
```
POST   /webhooks/cibil                # CIBIL score updates
POST   /webhooks/gstn                 # GST filing notifications
POST   /webhooks/e-courts             # Litigation updates
POST   /webhooks/mca                  # MCA filing updates
```

## Error Responses
```json
{
  "success": false,
  "error": {
    "code": "ERR_CODE",
    "message": "Human readable message",
    "details": {},
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Rate Limits
- Standard API: 1000 requests/hour
- Document Processing: 100 requests/hour  
- Research API: 50 requests/hour
- Scoring API: 200 requests/hour

## File Upload Specs
- Max file size: 50MB per file
- Supported formats: PDF, PNG, JPG, Excel, CSV, DOCX
- Batch upload: Max 10 files
- Automatic OCR processing for valid formats