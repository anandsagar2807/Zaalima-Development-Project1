# CreditSense - Complete Platform

## Platform Overview

Aurora Credit OS is an enterprise-grade AI-powered credit decisioning platform designed for BFSI institutions. It provides:

- **AI Scoring Engine**: Intelligent credit scoring with explainability
- **Risk Analytics**: Real-time risk assessment and monitoring
- **Document Processing**: Automated OCR and document parsing
- **Team Management**: Role-based access control and audit trails
- **Dashboard**: Real-time portfolio analytics and insights
- **Mobile Responsive**: Works seamlessly on all devices
- **Dark/Light Mode**: User preference support with system detection

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS with glassmorphism effects
- **UI Components**: Radix UI + custom components
- **Icons**: Lucide React (comprehensive icon library)
- **Dark Mode**: next-themes
- **State Management**: Zustand
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js (if applicable)
- **ORM**: Prisma
- **Database**: MongoDB + PostgreSQL (dual brain)
- **Authentication**: JWT tokens
- **API**: RESTful endpoints

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Deployment**: Vercel (frontend) / AWS/Digital Ocean (backend)
- **Database**: MongoDB (NoSQL) + PostgreSQL (relational)

---

## Quick Start

### Development

```bash
# Frontend setup
cd frontend
npm install
npm run dev

# Backend setup (in another terminal)
cd backend
npm install
npm run dev
```

Visit: `http://localhost:3000`

### Production with Docker

```bash
docker-compose up -d
```

---

## Project Structure

```
credit-decision/
├── frontend/              # Next.js application
│   ├── app/              # App router (pages)
│   │   ├── (auth)/       # Auth pages (login, register)
│   │   ├── (platform)/   # Platform pages (dashboard, etc)
│   │   ├── page.tsx      # Landing page
│   │   └── layout.tsx    # Root layout with theme provider
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Base UI components (Card, Button, etc)
│   │   ├── layout/      # Layout components (PlatformShell)
│   │   └── theme-*      # Theme switcher & provider
│   ├── lib/             # Utilities (API, helpers)
│   ├── public/          # Static files
│   └── app/globals.css  # Global styles with dark mode support
│
├── backend/              # Node.js backend
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── mongodb/     # MongoDB schemas
│   │   └── config/      # Configuration
│   ├── prisma/          # Prisma schema
│   └── package.json
│
├── docs/                # Documentation
├── DEPLOYMENT_GUIDE.md  # Deployment instructions
└── docker-compose.yml   # Docker composition
```

---

## Key Features

### 1. Authentication
- JWT-based auth with access/refresh tokens
- Secure login/register pages
- Protected dashboard routes

### 2. Applications Management
- Create and manage credit applications
- Track application status
- Full audit trails

### 3. Document Management
- Drag-drop upload interface
- Automatic OCR processing
- Document versioning

### 4. Scoring & Risk
- AI-powered credit scoring (5-C model)
- Risk classification (Excellent → Reject)
- Explainable ML with risk drivers

### 5. Dashboard
- Real-time portfolio analytics
- Key performance indicators
- Portfolio health overview

### 6. Team Management
- User roles and permissions (Credit Officer, Approver, etc)
- Activity logging
- Secure access control

### 7. Dark Mode
- System preference detection
- User preference persistence
- Optimized for both light and dark themes

---

## API Endpoints

### Authentication
```
POST   /api/v1/auth/login       - User login
POST   /api/v1/auth/register    - User registration
POST   /api/v1/auth/refresh     - Refresh token
```

### Applications
```
GET    /api/v1/applications     - List all applications
POST   /api/v1/applications     - Create application
GET    /api/v1/applications/:id - Get application details
PUT    /api/v1/applications/:id - Update application
DELETE /api/v1/applications/:id - Delete application
```

### Scoring
```
POST   /api/v1/scores           - Calculate credit score
GET    /api/v1/scores/:id       - Get score details
```

### Documents
```
POST   /api/v1/documents/upload - Upload document
GET    /api/v1/documents/:id    - Get document
DELETE /api/v1/documents/:id    - Delete document
```

---

## Pages & Routes

### Public Pages
- `/` - Landing page
- `/login` - User login
- `/register` - User registration

### Protected Pages (Requires login)
- `/dashboard` - Main dashboard
- `/applications` - Applications management
- `/documents` - Document management
- `/companies` - Company management
- `/scores` - Scoring interface
- `/users` - Team management
- `/risk` - Risk analytics

---

## Environment Setup

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_NAME=Aurora Credit OS
NEXT_PUBLIC_ENABLE_DARK_MODE=true
```

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/aurora_credit
JWT_SECRET=your_development_secret
```

---

## Security Features

1. **JWT Authentication**: Secure token-based auth
2. **HTTPS**: SSL/TLS encryption
3. **CORS**: Controlled cross-origin access
4. **Input Validation**: Server-side validation
5. **SQL Injection Prevention**: Parameterized queries
6. **XSS Protection**: Content sanitization
7. **Rate Limiting**: API endpoint protection
8. **Audit Logging**: Full activity tracking

---

## Performance Optimizations

1. **Code Splitting**: Automatic route-based splitting
2. **Image Optimization**: Next.js image component
3. **Caching Strategies**: Leverage browser/server caching
4. **Database Indexing**: Optimized MongoDB queries
5. **API Response Compression**: gzip enabled
6. **CSS Minification**: Tailwind purging in production
7. **JavaScript Minification**: SWC compiler

---

## Deployment

### Option 1: Vercel (Frontend)
```bash
npm run build
npm start
```

### Option 2: Docker
```bash
docker-compose up -d
```

### Option 3: Manual Server
```bash
npm install
npm run build
npm start
```

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

---

## Testing

```bash
# Frontend tests
cd frontend
npm run test

# Backend tests
cd backend
npm run test
```

---

## Monitoring & Logs

### Docker Logs
```bash
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Health Checks
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000/health`

---

## Troubleshooting

### Common Issues

**Port already in use**
```bash
lsof -ti:3000 | xargs kill -9
```

**Module not found**
```bash
npm install
npm run build
```

**Database connection error**
- Check MongoDB is running
- Verify connection string in .env
- Check network connectivity

---

## Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Create Pull Request

---

## License

Aurora Credit OS © 2026. All rights reserved.

---

## Support & Contact

- **Email**: support@aurora-credit-os.com
- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues tracker
- **Deployment Guide**: See `DEPLOYMENT_GUIDE.md`

---

## Deployment Status ✅

**Platform Status**: Production Ready
- ✅ All pages built and tested
- ✅ Dark/Light mode fully functional
- ✅ Environment configuration complete
- ✅ Docker setup ready
- ✅ Deployment guides created
- ✅ Security hardening applied
- ✅ Performance optimized

Your Aurora platform is ready for deployment! 🚀
