# Credit Decision Engine

A comprehensive credit decision support system for SME and corporate lending, featuring Five Cs framework-based risk scoring, document OCR parsing, and automated CAM (Credit Appraisal Memo) generation.

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** (v14 or higher)
3. **MongoDB** (v6 or higher)

### Installation

#### 1. Install PostgreSQL

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Or use Docker: `docker run -d --name postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=credit_decision -p 5432:5432 postgres:14`

**Mac:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux:**
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### 2. Install MongoDB

**Windows:**
- Download from: https://www.mongodb.com/try/download/community

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt install mongodb
sudo systemctl start mongodb
```

**Or use Docker:**
```bash
docker run -d --name mongodb -p 27017:27017 mongo:6
```

#### 3. Create PostgreSQL Database

```bash
# Using psql command line
psql -U postgres -c "CREATE DATABASE credit_decision;"

# Or connect to psql and run:
psql -U postgres
# Then:
CREATE DATABASE credit_decision;
\q
```

#### 4. Configure Environment

```bash
cd backend
cp .env.example .env
# Edit .env file with your database credentials
```

The default `.env` configuration:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/credit_decision?schema=public"
MONGODB_URI="mongodb://localhost:27017/credit_decision"
```

#### 5. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd frontend
npm install
```

#### 6. Initialize Database

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

#### 7. Start the Application

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

- Backend API: http://localhost:5000
- Frontend: http://localhost:3000

## 📁 Project Structure

```
credit-decision-engine/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # PostgreSQL schema
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js    # DB connections
│   │   ├── mongodb/
│   │   │   └── schemas.js     # MongoDB schemas
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── application.routes.js
│   │   │   ├── document.routes.js
│   │   │   ├── scoring.routes.js
│   │   │   ├── primaryInput.routes.js
│   │   │   ├── research.routes.js
│   │   │   ├── cam.routes.js
│   │   │   ├── dashboard.routes.js
│   │   │   └── risk.routes.js
│   │   ├── services/
│   │   │   └── scoringService.js
│   │   ├── utils/
│   │   │   └── logger.js
│   │   └── index.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── page.tsx          # Main dashboard
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/ui/
│   │   ├── dashboard-homepage.tsx
│   │   └── file-upload-component.tsx
│   ├── lib/
│   │   └── api.ts            # API client
│   ├── package.json
│   └── tailwind.config.js
└── docs/
    ├── API_ENDPOINTS.md
    ├── ML_RISK_MODEL.md
    ├── CAM_TEMPLATE_STRUCTURE.md
    ├── WEB_SCRAPER_DESIGN.md
    └── DEPLOYMENT_STRATEGY.md
```

## 🔧 Technology Stack

### Backend
- **Runtime:** Node.js with Express.js
- **Databases:**
  - PostgreSQL (Prisma ORM) - Structured data
  - MongoDB (Mongoose) - Document storage
- **Authentication:** JWT
- **Validation:** Joi/Zod

### Frontend
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Charts:** Recharts
- **State:** Zustand
- **Forms:** React Hook Form

## 📊 Key Features

1. **Five Cs Credit Scoring**
   - Character (Promoter credibility, litigation history)
   - Capacity (Financial capacity, cash flow)
   - Capital (Net worth, leverage)
   - Collateral (Security coverage)
   - Conditions (Sector conditions, business environment)

2. **Document Processing**
   - OCR parsing for GST returns, ITR, bank statements
   - Document validation and authenticity checks
   - Extraction of financial metrics

3. **Risk Assessment**
   - Five Cs framework implementation
   - Weighted scoring model
   - Sensitivity analysis
   - Explainable AI factors

4. **CAM Generation**
   - Automated Credit Appraisal Memo
   - PDF/DOCX export
   - Customizable templates

5. **Research Integration**
   - Web scraping for news and regulatory data
   - MCA filings integration
   - e-Courts litigation tracking

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Applications
- `GET /api/applications` - List all applications
- `POST /api/applications` - Create new application
- `GET /api/applications/:id` - Get application details
- `PUT /api/applications/:id` - Update application
- `POST /api/applications/:id/submit` - Submit for review

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/:id` - Get document
- `POST /api/documents/:id/process` - Process document (OCR)

### Scoring
- `POST /api/scoring/calculate/:applicationId` - Calculate credit score
- `GET /api/scoring/:applicationId` - Get scoring results
- `POST /api/scoring/sensitivity` - Run sensitivity analysis

### Primary Input
- `GET /api/primary-input/:applicationId` - Get primary input
- `POST /api/primary-input/:applicationId` - Submit primary input

### CAM
- `POST /api/cam/generate/:applicationId` - Generate CAM
- `GET /api/cam/:applicationId` - Get CAM document
- `PUT /api/cam/:id/approve` - Approve CAM

## 🔐 Environment Variables

Create a `.env` file in the backend directory:

```env
# Server
PORT=5000
NODE_ENV=development

# PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/credit_decision?schema=public"

# MongoDB
MONGODB_URI="mongodb://localhost:27017/credit_decision"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# AWS S3 (for document storage)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=ap-south-1
S3_BUCKET_NAME=credit-decision-documents

# External APIs
CIBIL_API_URL=https://api.cibil.com
CIBIL_API_KEY=your-cibil-api-key
MCA_API_URL=https://api.mca.gov.in
E_COURTS_API_URL=https://api.ecourts.gov.in

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=info
```

## 📈 Database Schema

### PostgreSQL (Prisma)
- **Company** - Business entity information
- **Application** - Credit applications
- **Document** - Uploaded documents
- **CreditScore** - Five Cs scoring results
- **PrimaryInput** - Credit officer inputs
- **Litigation** - Legal case tracking
- **ResearchData** - Web research data
- **CAM** - Credit Appraisal Memos
- **GSTAnalysis** - GST reconciliation
- **User** - System users

### MongoDB
- Document extractions
- OCR results
- Processing logs
- Audit trails

## 🚢 Deployment

See [docs/DEPLOYMENT_STRATEGY.md](docs/DEPLOYMENT_STRATEGY.md) for detailed deployment instructions.

### Quick Deploy Options

1. **Docker Compose** (Recommended)
```bash
docker-compose up -d
```

2. **AWS/Azure** 
- Use provided Terraform scripts
- Configure CI/CD pipeline

3. **Kubernetes**
- Helm charts in `/k8s` directory
- Auto-scaling configured

## 📖 Documentation

- [API Endpoints](docs/API_ENDPOINTS.md)
- [ML Risk Model](docs/ML_RISK_MODEL.md)
- [CAM Template Structure](docs/CAM_TEMPLATE_STRUCTURE.md)
- [Web Scraper Design](docs/WEB_SCRAPER_DESIGN.md)
- [Deployment Strategy](docs/DEPLOYMENT_STRATEGY.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Troubleshooting

### Database Connection Issues

If you see `Can't reach database server`:

1. **PostgreSQL not running:**
   ```bash
   # Windows - Start service
   net start postgresql-x64-14
   
   # Mac
   brew services start postgresql@14
   
   # Linux
   sudo systemctl start postgresql
   ```

2. **Check connection:**
   ```bash
   psql -U postgres -c "SELECT version();"
   ```

3. **Create database:**
   ```bash   psql -U postgres -c "CREATE DATABASE credit_decision;"
   ```

### Port Already in Use

```bash
# Find process using port 5000 (backend)
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# Find process using port 3000 (frontend)
netstat -ano | findstr :3000
taskkill /PID <process_id> /F
```

### npm Install Errors

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install