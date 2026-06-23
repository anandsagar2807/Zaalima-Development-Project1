# GitGuard AI - GitHub Integration Setup

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- GitHub account
- OpenAI API key (or compatible LLM API)

### 1. Clone and Install
```bash
cd "C:\Users\ADMIN\Downloads\GitGaurd Ai"
npm install
```

### 2. Setup GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the details:
   ```
   Application name: GitGuard AI (Development)
   Homepage URL: http://localhost:5173
   Authorization callback URL: http://localhost:4000/auth/github/callback
   ```
4. Click **"Register application"**
5. Copy the **Client ID**
6. Click **"Generate a new client secret"** and copy it

### 3. Configure Backend Environment

Create `backend/.env` from the example:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and add your credentials:
```bash
# Server
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gitguard_ai

# GitHub OAuth (from step 2)
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:4000/auth/github/callback

# Frontend
FRONTEND_URL=http://localhost:5173

# Security (generate with: openssl rand -base64 32)
JWT_SECRET=your_generated_jwt_secret
ENCRYPTION_KEY=your_generated_encryption_key

# GitHub Token (create at https://github.com/settings/tokens)
GITHUB_TOKEN=ghp_your_personal_access_token

# LLM API
LLM_API_KEY=sk-your_openai_api_key
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
```

### 4. Configure Frontend Environment

The `.env.example` is already configured. Just verify:
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 5. Setup Database

```bash
# Create database
createdb gitguard_ai

# Or using psql
psql -U postgres -c "CREATE DATABASE gitguard_ai;"
```

### 6. Start the Application

Open two terminals:

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 7. Test the Integration

1. Open browser: `http://localhost:5173`
2. Navigate to **Dashboard → Integrations**
3. Click **"Authorize GitHub"**
4. Authorize on GitHub
5. You'll be redirected back with your repositories loaded!

## 📋 Features Implemented

### ✅ GitHub OAuth 2.0 Integration
- Secure authorization flow with CSRF protection
- Encrypted token storage in PostgreSQL
- Automatic token expiration detection
- Session management with JWT

### ✅ Dynamic Repository Management
- Real-time fetching from GitHub API
- **No hardcoded or mock data**
- Pagination (30 repos per page)
- Search by name/description
- Sort by: updated, created, pushed, name
- Filter by: all, owner, public, private, member

### ✅ Repository Display
- Clean, modern card layout
- Repository metadata (stars, forks, language)
- Public/private visibility badges
- Last updated timestamps
- Direct links to GitHub
- Loading skeletons
- Empty states
- Error handling

### ✅ Profile Management
- GitHub profile display with avatar
- Follower/following counts
- Repository statistics
- Sync profile data
- Disconnect GitHub account

### ✅ UI/UX
- Dark/light mode support
- Responsive design (mobile-friendly)
- Smooth animations with Framer Motion
- Loading states and skeletons
- User-friendly error messages
- Accessible components

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Pages                                                │  │
│  │  - RepositoriesPage (main view)                      │  │
│  │  - IntegrationsPage (connect/manage)                 │  │
│  │  - ConnectGitHubPage (OAuth loading)                 │  │
│  │  - GitHubConnectedPage (success)                     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Components                                           │  │
│  │  - AuthorizeGitHubButton                             │  │
│  │  - RepositoryList                                     │  │
│  │  - RepositoryCard                                     │  │
│  │  - RepositoryFilters                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  State Management (Zustand)                          │  │
│  │  - githubStore (repos, pagination, filters)          │  │
│  │  - authStore (user, session, OAuth)                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                         Backend                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Routes                                               │  │
│  │  - /auth/github (OAuth initiation)                   │  │
│  │  - /auth/github/callback (OAuth callback)            │  │
│  │  - /api/github/profile (get profile)                 │  │
│  │  - /api/github/repos (get repositories)              │  │
│  │  - /api/github/disconnect (disconnect)               │  │
│  │  - /api/github/sync (sync profile)                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Middleware                                           │  │
│  │  - authMiddleware (JWT verification)                 │  │
│  │  - rateLimiter (API rate limiting)                   │  │
│  │  - errorHandler (centralized errors)                 │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Services                                             │  │
│  │  - user.service (CRUD, encryption)                   │  │
│  │  - jwt.utils (token generation/verification)         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Database (PostgreSQL)                                │  │
│  │  - users (encrypted tokens, profile data)            │  │
│  │  - logs (audit trail)                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                      GitHub API                              │
│  - OAuth authorization                                       │
│  - User profile (/user)                                      │
│  - Repositories (/user/repos)                                │
│  - User emails (/user/emails)                                │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
GitGaurd Ai/
├── backend/
│   ├── config/
│   │   ├── database.ts          # PostgreSQL connection
│   │   └── env.ts                # Environment variables
│   ├── middleware/
│   │   ├── auth.ts               # JWT authentication
│   │   ├── errorHandler.ts      # Error handling
│   │   └── rateLimiter.ts       # Rate limiting
│   ├── routes/
│   │   ├── auth.routes.ts       # OAuth endpoints
│   │   └── github.routes.ts     # GitHub API endpoints
│   ├── services/
│   │   └── user.service.ts      # User management
│   ├── utils/
│   │   ├── jwt.ts               # JWT utilities
│   │   └── logger.ts            # Logging
│   ├── app.ts                   # Express app setup
│   └── server.ts                # Server entry point
├── src/
│   ├── components/
│   │   ├── repositories/
│   │   │   ├── RepositoryList.tsx
│   │   │   ├── RepositoryCard.tsx
│   │   │   └── RepositoryFilters.tsx
│   │   ├── ui/                  # Shadcn components
│   │   └── AuthorizeGithubButton.tsx
│   ├── pages/
│   │   ├── dashboard/
│   │   │   ├── RepositoriesPage.tsx
│   │   │   └── IntegrationsPage.tsx
│   │   ├── ConnectGitHubPage.tsx
│   │   └── GitHubConnectedPage.tsx
│   ├── store/
│   │   ├── githubStore.ts       # GitHub state
│   │   └── authStore.ts         # Auth state
│   ├── services/
│   │   ├── githubApi.ts         # GitHub API client
│   │   └── apiClient.ts         # HTTP client
│   └── config/
│       └── api.config.ts        # API configuration
├── GITHUB_OAUTH_GUIDE.md        # Complete OAuth guide
├── ENV_SETUP.md                 # Environment setup
├── IMPLEMENTATION_SUMMARY.md    # Implementation details
└── README.md                    # This file
```

## 🔒 Security Features

- **OAuth 2.0**: Industry-standard authorization
- **CSRF Protection**: State token validation
- **Encrypted Tokens**: AES-256 encryption for access tokens
- **HttpOnly Cookies**: Prevents XSS attacks
- **SameSite Cookies**: Prevents CSRF attacks
- **JWT Authentication**: Secure session management
- **Rate Limiting**: Prevents abuse
- **Token Expiration**: Automatic detection and re-auth

## 🧪 Testing

### Manual Testing Checklist

- [ ] OAuth flow completes successfully
- [ ] Repositories load from GitHub API
- [ ] Search filters repositories
- [ ] Sort changes order (updated/created/name)
- [ ] Type filter works (all/owner/public/private)
- [ ] Pagination navigates correctly
- [ ] Profile displays with correct stats
- [ ] Sync updates profile data
- [ ] Disconnect removes GitHub connection
- [ ] Error messages display correctly
- [ ] Loading states show properly
- [ ] Empty states appear when no repos
- [ ] External links open GitHub
- [ ] Dark/light mode works
- [ ] Mobile responsive design

### API Testing

```bash
# Test OAuth initiation
curl http://localhost:4000/auth/github

# Test profile (requires auth cookie)
curl -b cookies.txt http://localhost:4000/api/github/profile

# Test repositories
curl -b cookies.txt "http://localhost:4000/api/github/repos?page=1&per_page=30&sort=updated"
```

## 🐛 Troubleshooting

### OAuth Callback Fails
**Problem**: Redirected to error page after GitHub authorization

**Solutions**:
- Verify `GITHUB_CALLBACK_URL` in `.env` matches GitHub OAuth app settings exactly
- Check backend is running on port 4000
- Ensure `FRONTEND_URL` is correct (http://localhost:5173)

### Repositories Not Loading
**Problem**: Empty list or error when viewing repositories

**Solutions**:
- Check browser console for errors
- Verify GitHub token is valid (not expired)
- Ensure user has repositories on GitHub
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running and accessible

### Database Connection Error
**Problem**: Backend fails to start with database error

**Solutions**:
- Verify PostgreSQL is running: `pg_isready`
- Check database exists: `psql -l | grep gitguard_ai`
- Verify `DATABASE_URL` format is correct
- Create database if missing: `createdb gitguard_ai`

### CORS Errors
**Problem**: Browser shows CORS policy errors

**Solutions**:
- Verify `FRONTEND_URL` in backend `.env` matches frontend URL
- Check CORS middleware is configured in `backend/app.ts`
- Ensure credentials are included in fetch requests

## 📚 Documentation

- **[GITHUB_OAUTH_GUIDE.md](./GITHUB_OAUTH_GUIDE.md)** - Complete OAuth implementation guide
- **[ENV_SETUP.md](./ENV_SETUP.md)** - Detailed environment setup
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical implementation details

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong, unique JWT_SECRET and ENCRYPTION_KEY
- [ ] Update GitHub OAuth callback URL to production domain
- [ ] Use HTTPS for all URLs
- [ ] Enable secure cookies (`secure: true`)
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Enable rate limiting
- [ ] Add monitoring and logging
- [ ] Set up SSL certificates
- [ ] Configure environment variables in hosting platform

### Recommended Hosting

- **Frontend**: Vercel, Netlify, or Cloudflare Pages
- **Backend**: Railway, Render, or Heroku
- **Database**: Supabase, Railway, or managed PostgreSQL

## 🎯 Next Steps

### Phase 2 Features
- Repository detail pages (commits, branches, contributors)
- Webhook integration for real-time updates
- Repository settings management (enable/disable features)
- Bulk operations on multiple repositories

### Phase 3 Features
- Advanced analytics dashboard
- Code quality metrics per repository
- Security vulnerability scanning
- Automated PR review system

### Phase 4 Features
- Multi-platform support (GitLab, Bitbucket)
- Team collaboration features
- Custom rules and workflows
- Public API for third-party integrations

## 🤝 Contributing

This is a production-ready implementation. To extend:

1. Follow existing code patterns
2. Maintain TypeScript types
3. Add error handling
4. Update documentation
5. Test thoroughly

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Built with React, TypeScript, Express, and PostgreSQL
- UI components from Shadcn/ui
- Icons from Lucide React
- State management with Zustand
- Animations with Framer Motion

---

**Status**: ✅ Production Ready

**Last Updated**: May 8, 2026

**Version**: 1.0.0
