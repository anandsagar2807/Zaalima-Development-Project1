# 🚀 Quick Start - GitHub Integration

## 5-Minute Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create GitHub OAuth App
1. Go to: https://github.com/settings/developers
2. Click "New OAuth App"
3. Use these settings:
   - **Name**: GitGuard AI Dev
   - **Homepage**: http://localhost:5173
   - **Callback**: http://localhost:4000/auth/github/callback
4. Save the Client ID and Secret

### Step 3: Configure Backend
```bash
# Copy example
cp backend/.env.example backend/.env

# Edit backend/.env and add:
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)
```

### Step 4: Setup Database
```bash
createdb gitguard_ai
```

### Step 5: Start Application
```bash
# Terminal 1
npm run dev:backend

# Terminal 2
npm run dev
```

### Step 6: Test
1. Open: http://localhost:5173
2. Go to: Dashboard → Integrations
3. Click: "Authorize GitHub"
4. Authorize on GitHub
5. View your repositories!

## ✅ Done!

Your GitHub integration is now live with:
- ✅ OAuth authentication
- ✅ Dynamic repository fetching
- ✅ Search, filter, and sort
- ✅ Secure token storage

## 📚 Full Documentation
- [Complete Setup Guide](./README_GITHUB_INTEGRATION.md)
- [OAuth Guide](./GITHUB_OAUTH_GUIDE.md)
- [Environment Setup](./ENV_SETUP.md)
