# ✅ GitGuard AI - Complete Setup Guide

Your environment is now configured! Follow these steps to get started.

---

## 🎯 Quick Start (5 Minutes)

### Step 1: Verify Environment Files

Check that both environment files exist:

```bash
# Check frontend environment
cat .env.frontend

# Check backend environment
cat backend/.env.backend
```

Both files should be present and configured.

---

### Step 2: Install Dependencies

```bash
npm install
```

---

### Step 3: Start the Backend

Open a terminal and run:

```bash
npm run dev:backend
```

You should see:
```
✓ Backend server started on port 4000
✓ Environment loaded from backend/.env.backend
```

**Keep this terminal running!**

---

### Step 4: Start the Frontend

Open a **new terminal** and run:

```bash
npm run dev
```

You should see:
```
✓ Next.js running on http://localhost:3000
✓ Environment loaded from .env.frontend
```

---

### Step 5: Open the Application

Open your browser and navigate to:

**http://localhost:3000**

---

## 🔐 GitHub OAuth Setup

Your GitHub OAuth App is already configured with:

- **Client ID**: `Ov23lieDJq9lEOP7aoZO`
- **Client Secret**: `40436febbdcbb4e0f657cbf98cbeb7a72688441c`
- **Callback URL**: `http://localhost:4000/api/auth/github/callback`

### Test the OAuth Flow

1. Click **"Sign In"** or **"Authorize GitHub"** button
2. You'll be redirected to GitHub
3. Authorize the application
4. You'll be redirected back to the dashboard
5. Your repositories will load automatically

---

## 📁 Environment Configuration

### Frontend (.env.frontend)

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_GITHUB_CLIENT_ID=Ov23lieDJq9lEOP7aoZO
NEXT_PUBLIC_APP_NAME=GitGuard AI
NEXT_PUBLIC_APP_ENV=development
```

### Backend (backend/.env.backend)

```bash
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gitguard_ai
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ENCRYPTION_KEY=your-super-secret-encryption-key-change-in-production
GITHUB_CLIENT_ID=Ov23lieDJq9lEOP7aoZO
GITHUB_CLIENT_SECRET=40436febbdcbb4e0f657cbf98cbeb7a72688441c
GITHUB_CALLBACK_URL=http://localhost:4000/api/auth/github/callback
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

---

## 🎨 Features Available

### ✅ Working Features

1. **GitHub OAuth Authentication**
   - Sign in with GitHub
   - Secure token storage
   - Session management

2. **Repository Management**
   - View all your GitHub repositories
   - Search and filter repositories
   - Sort by updated, created, stars
   - Pagination support

3. **Repository Details**
   - Name and description
   - Visibility (public/private)
   - Language
   - Stars and forks
   - Last updated time

4. **Profile Management**
   - View GitHub profile
   - Sync profile data
   - Disconnect GitHub account

5. **Dashboard**
   - Overview statistics
   - Recent activity
   - Quick actions

---

## 🔧 Optional Configuration

### Database Setup (Optional)

If you want to persist data:

1. **Install PostgreSQL**
   ```bash
   # macOS
   brew install postgresql
   
   # Ubuntu/Debian
   sudo apt-get install postgresql
   
   # Windows
   # Download from: https://www.postgresql.org/download/windows/
   ```

2. **Create Database**
   ```bash
   createdb gitguard_ai
   ```

3. **Update DATABASE_URL** in `backend/.env.backend`
   ```bash
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gitguard_ai
   ```

### LLM API Setup (Optional)

For AI-powered code reviews:

1. **Get OpenAI API Key**
   - Visit: https://platform.openai.com/api-keys
   - Create a new API key

2. **Update LLM_API_KEY** in `backend/.env.backend`
   ```bash
   LLM_API_KEY=sk-proj-your-openai-key-here
   ```

### Generate Secure Keys (Recommended for Production)

```bash
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate Encryption Key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Update these in `backend/.env.backend`:
```bash
JWT_SECRET=<generated-jwt-secret>
ENCRYPTION_KEY=<generated-encryption-key>
```

---

## 🧪 Testing the Integration

### Test 1: Backend Health Check

```bash
curl http://localhost:4000/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-05-08T..."}
```

### Test 2: Frontend API Connection

Open browser console on http://localhost:3000 and check for:
- No CORS errors
- API calls to `http://localhost:4000`
- Successful responses

### Test 3: GitHub OAuth Flow

1. Click "Authorize GitHub"
2. Check browser network tab
3. Should see:
   - Redirect to `github.com/login/oauth/authorize`
   - Callback to `localhost:4000/api/auth/github/callback`
   - Redirect to dashboard with session cookie

### Test 4: Repository Fetching

After OAuth:
1. Navigate to Repositories page
2. Should see your GitHub repositories
3. Try search, filter, and sort
4. Check pagination works

---

## 🚨 Troubleshooting

### Backend won't start

**Error**: `Port 4000 already in use`

**Solution**:
```bash
# Kill process on port 4000
npx kill-port 4000

# Or on Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### Frontend won't start

**Error**: `Port 3000 already in use`

**Solution**:
```bash
# Kill process on port 3000
npx kill-port 3000
```

### CORS Errors

**Error**: `Access-Control-Allow-Origin`

**Solution**: Verify `FRONTEND_URL` in `backend/.env.backend` matches your frontend URL exactly:
```bash
FRONTEND_URL=http://localhost:3000
```

### GitHub OAuth Fails

**Error**: `redirect_uri_mismatch`

**Solution**: 
1. Go to https://github.com/settings/developers
2. Find your OAuth App
3. Verify callback URL is: `http://localhost:4000/api/auth/github/callback`

### No Repositories Showing

**Possible causes**:
1. Not authenticated - Click "Authorize GitHub"
2. No repositories in your account
3. API error - Check browser console and backend logs

### Environment Variables Not Loading

**Solution**:
```bash
# Restart both servers
# Terminal 1
npm run dev:backend

# Terminal 2
npm run dev
```

---

## 📊 Project Structure

```
GitGuard AI/
├── .env.frontend              # Frontend environment variables
├── backend/
│   ├── .env.backend          # Backend environment variables
│   ├── config/
│   │   └── env.ts            # Environment loader
│   ├── routes/               # API routes
│   ├── controllers/          # Business logic
│   └── server.ts             # Server entry point
├── src/
│   ├── pages/                # Next.js pages
│   ├── components/           # React components
│   ├── services/
│   │   ├── apiClient.ts      # API client
│   │   └── githubApi.ts      # GitHub API wrapper
│   ├── store/
│   │   ├── authStore.ts      # Auth state
│   │   └── githubStore.ts    # GitHub state
│   └── config/
│       └── api.config.ts     # API configuration
└── package.json              # Dependencies & scripts
```

---

## 🎯 Next Steps

### 1. Customize Your Setup

- Update `NEXT_PUBLIC_APP_NAME` in `.env.frontend`
- Generate secure keys for production
- Set up PostgreSQL database

### 2. Explore Features

- Connect your GitHub account
- Browse your repositories
- Try search and filters
- Check your profile stats

### 3. Deploy to Production

See `DEPLOYMENT_GUIDE.md` for:
- Vercel deployment
- Environment variable setup
- Domain configuration
- SSL/HTTPS setup

---

## 📚 Additional Documentation

- **ENVIRONMENT_SETUP_GUIDE.md** - Detailed environment setup
- **README_GITHUB_INTEGRATION.md** - GitHub OAuth guide
- **GITHUB_OAUTH_GUIDE.md** - OAuth implementation details
- **README.md** - Project overview

---

## ✅ Verification Checklist

- [ ] Backend running on port 4000
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:3000
- [ ] GitHub OAuth button visible
- [ ] Can click "Authorize GitHub"
- [ ] Redirected to GitHub
- [ ] Can authorize the app
- [ ] Redirected back to dashboard
- [ ] Repositories load successfully
- [ ] Search and filters work
- [ ] Profile page shows GitHub data

---

## 🎉 You're All Set!

Your GitGuard AI application is now fully configured and ready to use!

**Start developing:**
```bash
# Terminal 1
npm run dev:backend

# Terminal 2
npm run dev
```

**Access the app:**
http://localhost:3000

---

**Need help?** Check the troubleshooting section above or review the documentation files.

**Last Updated:** May 8, 2026  
**GitGuard AI** - Complete Setup Guide
