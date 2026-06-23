# Environment Setup Guide

Complete guide to configure environment variables for GitGuard AI with GitHub OAuth integration.

---

## 📋 Quick Setup Checklist

- [ ] Copy `.env.example` to `.env.frontend`
- [ ] Copy `backend/.env.example` to `backend/.env.backend`
- [ ] Create GitHub OAuth App
- [ ] Configure GitHub credentials
- [ ] Generate secure JWT and encryption keys
- [ ] Set up PostgreSQL database
- [ ] (Optional) Configure LLM API key
- [ ] Test the configuration

---

## 🔧 Step 1: Copy Environment Files

### Frontend

```bash
# Copy the example file
cp .env.example .env.frontend

# Or on Windows
copy .env.example .env.frontend
```

### Backend

```bash
# Copy the example file
cp backend/.env.example backend/.env.backend

# Or on Windows
copy backend\.env.example backend\.env.backend
```

---

## 🔐 Step 2: Create GitHub OAuth App

### 2.1 Navigate to GitHub Settings

1. Go to: https://github.com/settings/developers
2. Click **"OAuth Apps"** in the left sidebar
3. Click **"New OAuth App"** button

### 2.2 Configure OAuth App

Fill in the following details:

| Field | Value (Development) | Value (Production) |
|-------|---------------------|-------------------|
| **Application name** | GitGuard AI (Dev) | GitGuard AI |
| **Homepage URL** | `http://localhost:3000` | `https://your-domain.com` |
| **Application description** | AI-Powered Code Review Platform | AI-Powered Code Review Platform |
| **Authorization callback URL** | `http://localhost:4000/api/auth/github/callback` | `https://api.your-domain.com/api/auth/github/callback` |

### 2.3 Get Credentials

After creating the app:

1. Copy the **Client ID** (e.g., `Ov23lieDJq9lEOP7aoZO`)
2. Click **"Generate a new client secret"**
3. Copy the **Client Secret** (you'll only see this once!)

---

## 📝 Step 3: Configure Frontend Environment

Edit `.env.frontend`:

```bash
# API Base URL (backend server)
NEXT_PUBLIC_API_URL=http://localhost:4000

# GitHub OAuth - paste your Client ID here
NEXT_PUBLIC_GITHUB_CLIENT_ID=Ov23lieDJq9lEOP7aoZO

# App Configuration
NEXT_PUBLIC_APP_NAME=GitGuard AI
NEXT_PUBLIC_APP_ENV=development
```

### Frontend Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | `http://localhost:4000` |
| `NEXT_PUBLIC_GITHUB_CLIENT_ID` | GitHub OAuth Client ID | `Ov23lieDJq9lEOP7aoZO` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `GitGuard AI` |
| `NEXT_PUBLIC_APP_ENV` | Environment | `development` or `production` |

---

## 🔧 Step 4: Configure Backend Environment

Edit `backend/.env.backend`:

### 4.1 Basic Configuration

```bash
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 4.2 GitHub OAuth Configuration

```bash
# Paste your GitHub OAuth credentials here
GITHUB_CLIENT_ID=Ov23lieDJq9lEOP7aoZO
GITHUB_CLIENT_SECRET=40436febbdcbb4e0f657cbf98cbeb7a72688441c
GITHUB_CALLBACK_URL=http://localhost:4000/api/auth/github/callback
```

### 4.3 Generate Secure Keys

**Generate JWT Secret:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and paste it as `JWT_SECRET`:

```bash
JWT_SECRET=a1b2c3d4e5f6...your-generated-key
```

**Generate Encryption Key:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as `ENCRYPTION_KEY`:

```bash
ENCRYPTION_KEY=x1y2z3a4b5c6...your-generated-key
```

### 4.4 Database Configuration

**Option A: Local PostgreSQL**

```bash
# Install PostgreSQL first, then create database
createdb gitguard_ai

# Configure connection
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gitguard_ai
```

**Option B: Cloud Database (Recommended for Production)**

Use services like:
- **Supabase**: https://supabase.com (Free tier available)
- **Neon**: https://neon.tech (Free tier available)
- **Railway**: https://railway.app (Free tier available)

Example Supabase connection string:
```bash
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

### 4.5 LLM Configuration (Optional)

For AI-powered code reviews:

**OpenAI:**
```bash
LLM_API_KEY=sk-proj-...your-openai-key
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
```

**Alternative Providers:**

- **Anthropic Claude**: https://console.anthropic.com
- **Groq**: https://console.groq.com (Fast & Free)
- **Together AI**: https://api.together.xyz
- **OpenRouter**: https://openrouter.ai (Access multiple models)

### 4.6 GitHub Personal Access Token (Optional)

For advanced features like webhooks:

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Select scopes: `repo`, `admin:repo_hook`, `read:user`
4. Copy the token

```bash
GITHUB_TOKEN=ghp_...your-personal-access-token
GITHUB_WEBHOOK_SECRET=your-random-webhook-secret
```

---

## 📊 Complete Backend Environment Example

```bash
PORT=4000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gitguard_ai

# Security Keys (GENERATE NEW ONES!)
JWT_SECRET=a1b2c3d4e5f6789...64-char-hex-string
ENCRYPTION_KEY=x1y2z3a4b5c6789...32-char-hex-string

# GitHub OAuth
GITHUB_CLIENT_ID=Ov23lieDJq9lEOP7aoZO
GITHUB_CLIENT_SECRET=40436febbdcbb4e0f657cbf98cbeb7a72688441c
GITHUB_CALLBACK_URL=http://localhost:4000/api/auth/github/callback

# Frontend
FRONTEND_URL=http://localhost:3000

# Environment
NODE_ENV=development

# Optional: GitHub Token
GITHUB_TOKEN=ghp_your_token_here
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# Optional: LLM
LLM_API_KEY=sk-your_api_key_here
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
LLM_MAX_TOKENS=4096
LLM_TIMEOUT_MS=60000
LLM_MAX_DIFF_SIZE=50000

# Insforge (Disabled)
ENABLE_INSFORGE=false
INSFORGE_API_BASE_URL=
INSFORGE_API_KEY=
```

---

## ✅ Step 5: Verify Configuration

### 5.1 Check Environment Files Exist

```bash
# Should show both files
ls -la .env.frontend backend/.env.backend

# On Windows
dir .env.frontend
dir backend\.env.backend
```

### 5.2 Test Backend

```bash
# Start backend
npm run dev:backend

# Should see:
# ✓ Server running on http://localhost:4000
# ✓ Database connected
```

### 5.3 Test Frontend

```bash
# Start frontend (in a new terminal)
npm run dev

# Should see:
# ✓ Next.js running on http://localhost:3000
```

### 5.4 Test GitHub OAuth Flow

1. Open browser: http://localhost:3000
2. Click **"Sign In"** or **"Authorize GitHub"**
3. You should be redirected to GitHub
4. Authorize the app
5. You should be redirected back to the dashboard

---

## 🚨 Common Issues & Solutions

### Issue: "GitHub OAuth App not found"

**Solution:** Double-check your `GITHUB_CLIENT_ID` matches the one from GitHub settings.

### Issue: "Invalid redirect_uri"

**Solution:** Ensure `GITHUB_CALLBACK_URL` in backend matches the callback URL in your GitHub OAuth App settings exactly.

### Issue: "Database connection failed"

**Solution:** 
- Check PostgreSQL is running: `pg_isready`
- Verify database exists: `psql -l | grep gitguard_ai`
- Check connection string format

### Issue: "CORS errors"

**Solution:** Ensure `FRONTEND_URL` in backend matches your frontend URL exactly (including port).

### Issue: "Token encryption failed"

**Solution:** Generate a new `ENCRYPTION_KEY` using the command in Step 4.3.

---

## 🌐 Production Deployment

### Update URLs

**Frontend (.env.frontend):**
```bash
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_APP_ENV=production
```

**Backend (backend/.env.backend):**
```bash
FRONTEND_URL=https://your-domain.com
NODE_ENV=production
GITHUB_CALLBACK_URL=https://api.your-domain.com/api/auth/github/callback
```

### Update GitHub OAuth App

1. Go to your GitHub OAuth App settings
2. Update **Homepage URL** to your production domain
3. Update **Authorization callback URL** to your production API callback

### Security Checklist

- [ ] Generate new `JWT_SECRET` and `ENCRYPTION_KEY`
- [ ] Use strong database password
- [ ] Enable SSL/TLS (HTTPS)
- [ ] Set up environment variables in hosting platform
- [ ] Never commit `.env.frontend` or `backend/.env.backend` to git
- [ ] Use secrets management (AWS Secrets Manager, Vault, etc.)

---

## 📚 Additional Resources

- **GitHub OAuth Documentation**: https://docs.github.com/en/apps/oauth-apps
- **Next.js Environment Variables**: https://nextjs.org/docs/basic-features/environment-variables
- **PostgreSQL Setup**: https://www.postgresql.org/docs/current/tutorial-install.html
- **OpenAI API Keys**: https://platform.openai.com/api-keys

---

## 🆘 Need Help?

If you encounter issues:

1. Check the logs: `npm run dev:backend` and `npm run dev`
2. Verify all environment variables are set correctly
3. Ensure all services (PostgreSQL, backend, frontend) are running
4. Check GitHub OAuth App configuration matches your environment files

---

**Last Updated:** May 8, 2026  
**GitGuard AI** - Environment Setup Guide
