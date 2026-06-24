# GitHub OAuth Integration - Complete Documentation

**Status:** ✅ Fully Implemented and Tested  
**Last Updated:** June 2026  
**Project:** GitGuard AI

---

## 📋 Quick Start

1. **Apply database schema:**
   ```bash
   psql -d gitguard_ai -f backend/database/schema.sql
   ```

2. **Start the application:**
   ```bash
   npm run dev
   ```

3. **Test OAuth flow:**
   - Navigate to `http://localhost:3000/connect-github`
   - Click "Authorize GitHub"
   - Approve on GitHub
   - Verify redirect to dashboard

---

## 🏗️ Architecture Overview

```
User clicks "Authorize GitHub"
    ↓
Frontend redirects to Backend OAuth endpoint
    ↓
Backend redirects to GitHub OAuth
    ↓
User authorizes on GitHub
    ↓
GitHub redirects to Backend callback
    ↓
Backend exchanges code for access token
    ↓
Backend stores encrypted token in database
    ↓
Backend creates/updates user session
    ↓
Backend redirects to Frontend success page
    ↓
Frontend fetches repositories from Backend
    ↓
Backend uses stored token to fetch from GitHub API
```

---

## 🔧 Implementation Details

### Backend Endpoints

**File:** `backend/routes/auth.routes.ts`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/github` | GET | Initiates OAuth flow |
| `/auth/github/callback` | GET | Handles OAuth callback |
| `/api/auth/me` | GET | Returns current user info |
| `/auth/logout` | POST | Logs out user |

**File:** `backend/routes/github.routes.ts`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/github/profile` | GET | Fetches GitHub profile |
| `/api/github/repos` | GET | Fetches repositories (paginated, searchable) |
| `/api/github/disconnect` | POST | Disconnects GitHub account |
| `/api/github/sync` | POST | Syncs GitHub profile data |

### Frontend Components

| File | Purpose |
|------|---------|
| `src/app/connect-github/page.tsx` | Consent screen with permissions |
| `src/components/AuthorizeGithubButton.tsx` | OAuth initiation button |
| `src/components/auth/github-connect-modal.tsx` | Automatic connection prompt |
| `src/store/authStore.ts` | Zustand auth state management |

---

## 🔒 Security Features

| Feature | Implementation |
|---------|----------------|
| **CSRF Protection** | Random `state` parameter validated against cookie |
| **Token Storage** | Encrypted in Clerk `privateMetadata` + PostgreSQL |
| **Cookies** | `httpOnly`, `secure` (prod), `sameSite: lax` |
| **Error Handling** | No sensitive data exposed in error messages |

---

## ⚙️ Configuration

### Frontend (`.env.frontend`)
```env
NEXT_PUBLIC_GITHUB_CLIENT_ID=Ov23lieDJq9lEOP7aoZO
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Backend (`backend/.env.backend`)
```env
GITHUB_CLIENT_ID=Ov23lieDJq9lEOP7aoZO
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=http://localhost:4000/api/auth/github/callback
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gitguard_ai
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
```

### GitHub OAuth App Settings
- **Application name:** GitGuard AI
- **Homepage URL:** http://localhost:3000
- **Authorization callback URL:** http://localhost:4000/api/auth/github/callback
- **Scopes:** `read:user`, `user:email`, `repo`

---

## 🗄️ Database Schema

**Table:** `github_connections`

```sql
CREATE TABLE IF NOT EXISTS github_connections (
    id BIGSERIAL PRIMARY KEY,
    clerk_user_id TEXT NOT NULL UNIQUE,
    github_login TEXT,
    access_token TEXT NOT NULL,
    scope TEXT,
    connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 🔄 OAuth Flow Details

### Step 1: User Initiates Connection
- User navigates to `/connect-github`
- Sees consent screen explaining permissions
- Clicks "Authorize GitHub" button

### Step 2: OAuth Initiation
- Backend generates random `state` parameter
- Constructs GitHub OAuth URL with client_id, scope, state, redirect_uri
- Sets secure cookie `gitguard_github_oauth_state`
- Redirects to GitHub's authorization page

### Step 3: GitHub Authorization
- User logs in (if needed)
- Reviews and approves permissions
- GitHub redirects back with `code` and `state`

### Step 4: Token Exchange & Storage
- Backend validates `state` matches cookie (CSRF protection)
- Exchanges `code` for access token via GitHub API
- Fetches GitHub user profile
- Stores token encrypted in Clerk + PostgreSQL
- Sets success cookies

### Step 5: Post-Connection
- Redirects to `/dashboard?github_connected=1&github_login=username`
- Modal auto-dismisses
- User can now access GitHub-integrated features

---

## 🧪 Testing Guide

### Prerequisites Checklist
- [ ] PostgreSQL running
- [ ] Database schema applied
- [ ] `.env.frontend` configured
- [ ] `backend/.env.backend` configured
- [ ] Frontend on port 3000
- [ ] Backend on port 4000

### Test Steps

1. **Navigate to Connect Page**
   - URL: `http://localhost:3000/connect-github`
   - Verify: Logo, heading, permission items, "Authorize GitHub" button

2. **Click "Authorize GitHub"**
   - Verify: Redirect to `/api/connect-github`
   - Verify: Redirect to GitHub with correct parameters
   - Check: `gitguard_github_oauth_state` cookie set

3. **GitHub Authorization**
   - Verify: Login page (if needed)
   - Verify: Permission list shows correct scopes
   - Click "Authorize"

4. **Callback Processing**
   - Verify: Redirect to `/connect-github/callback`
   - Verify: Redirect to `/dashboard?github_connected=1&github_login=...`
   - Check: Success cookies set

5. **Database Verification**
   ```bash
   psql -d gitguard_ai -c "SELECT clerk_user_id, github_login, connected_at FROM github_connections;"
   ```

6. **Clerk Metadata Verification**
   - Public Metadata: `gitguardGithubConnected: true`, `gitguardGithubLogin: "username"`
   - Private Metadata: Contains encrypted `accessToken`

---

## 🚨 Error Scenarios

| Error | Cause | Redirect |
|-------|-------|----------|
| `missing_code_or_state` | GitHub didn't return code/state | `/connect-github?error=...` |
| `invalid_oauth_state` | State mismatch (CSRF attempt) | `/connect-github?error=...` |
| `missing_oauth_config` | Client ID/Secret not configured | `/connect-github?error=...` |
| `token_exchange_failed` | GitHub token API error | `/connect-github?error=...` |
| `missing_access_token` | No token in GitHub response | `/connect-github?error=...` |
| `insforge_persist_failed` | Database insert failed | `/connect-github?error=...` |

---

## 📚 File Reference

### Core Implementation Files
- `backend/routes/auth.routes.ts` - OAuth routes
- `backend/routes/github.routes.ts` - GitHub API routes
- `backend/controllers/reviews.controller.ts` - AI review integration
- `backend/services/ai-review.service.ts` - OpenRouter AI analysis
- `backend/config/env.ts` - Environment configuration
- `frontend/src/app/connect-github/page.tsx` - Consent screen
- `frontend/src/app/api/connect-github/route.ts` - OAuth initiation
- `frontend/src/app/api/connect-github/callback/route.ts` - OAuth callback
- `frontend/src/store/authStore.ts` - Auth state management

### Database
- `backend/database/schema.sql` - Schema definition

---

## 🚀 Production Deployment

### 1. Update GitHub OAuth App
- Add production callback URL: `https://yourdomain.com/api/auth/github/callback`
- Update homepage URL to production domain

### 2. Environment Variables
- Set production `DATABASE_URL`
- Set production `JWT_SECRET` and `ENCRYPTION_KEY`
- Use HTTPS (required by GitHub OAuth)

### 3. Security Checklist
- [ ] HTTPS enabled
- [ ] Production database
- [ ] Environment variables secured
- [ ] GitHub OAuth app updated with production URLs
- [ ] Rate limiting configured

---

## 📖 Additional Resources

- [GitHub OAuth Documentation](https://docs.github.com/en/apps/oauth-apps)
- [Clerk Documentation](https://clerk.com/docs)
- [OpenRouter API](https://openrouter.ai/docs)

---

## 🎉 Summary

The GitHub OAuth integration is **fully implemented** with:

- ✅ Secure OAuth 2.0 flow with CSRF protection
- ✅ Dual token storage (Clerk + PostgreSQL)
- ✅ Beautiful, responsive UI
- ✅ Comprehensive error handling
- ✅ Full testing coverage
- ✅ Production deployment guide