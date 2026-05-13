# GitGuard AI - MongoDB Migration & OAuth Setup Complete

## ✅ What Was Done

### 1. **Database Migration: PostgreSQL → MongoDB**
   - ✅ Removed `pg` and `@types/pg` dependencies
   - ✅ Installed `mongoose` for MongoDB
   - ✅ Created MongoDB models:
     - `backend/models/User.ts` - User schema with GitHub OAuth fields
     - `backend/models/Log.ts` - Activity log schema
   - ✅ Updated `backend/config/database.ts` - MongoDB connection with Mongoose
   - ✅ Updated `backend/config/env.ts` - Changed `databaseUrl` to `mongoUri`
   - ✅ Refactored `backend/services/user.service.ts` - All user operations now use Mongoose
   - ✅ Updated `backend/middleware/auth.ts` - Works with MongoDB ObjectIds
   - ✅ Stubbed `backend/services/database.service.ts` and `backend/services/dashboard.service.ts` - Return mock data until MongoDB queries are implemented

### 2. **GitHub OAuth Flow Fixed**
   - ✅ Updated `backend/routes/auth.routes.ts`:
     - `GET /api/auth/github` - Initiates OAuth, redirects to GitHub
     - `GET /api/auth/github/callback` - Handles callback, creates/updates user in MongoDB
     - Proper state token CSRF protection
     - Redirects to `http://localhost:3000/dashboard?github_connected=true` after success
   - ✅ Updated environment files with correct callback URL

### 3. **Environment Configuration**
   - ✅ Updated `backend/.env.backend`:
     - Removed `DATABASE_URL` (PostgreSQL)
     - Added `MONGO_URI` (MongoDB)
     - Callback URL: `http://localhost:4000/api/auth/github/callback`

## 🚀 How to Use

### Step 1: Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB locally, then use:
MONGO_URI=mongodb://localhost:27017/gitguard_ai
```

**Option B: MongoDB Atlas (Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user
4. Get your connection string
5. Update `backend/.env.backend`:
```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/gitguard_ai?retryWrites=true&w=majority
```

### Step 2: Configure GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: GitGuard AI (Local)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:4000/api/auth/github/callback`
4. Click "Register application"
5. Copy your credentials to `backend/.env.backend`:
```
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
```

### Step 3: Start the Application

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```
Backend runs on http://localhost:4000

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Frontend runs on http://localhost:3000

### Step 4: Test OAuth Flow

1. Open http://localhost:3000
2. Click "Connect GitHub" or navigate to integrations
3. You'll be redirected to: `http://localhost:4000/api/auth/github`
4. Backend redirects you to GitHub authorization page
5. Click "Authorize" on GitHub
6. GitHub redirects to: `http://localhost:4000/api/auth/github/callback`
7. Backend creates/updates your user in MongoDB
8. Backend redirects you to: `http://localhost:3000/dashboard?github_connected=true`

## 📁 File Structure

```
backend/
├── models/
│   ├── User.ts          # MongoDB User schema
│   └── Log.ts           # MongoDB Log schema
├── config/
│   ├── database.ts      # MongoDB connection
│   └── env.ts           # Environment variables (mongoUri)
├── services/
│   ├── user.service.ts  # User CRUD with Mongoose
│   ├── database.service.ts  # Stub (TODO: implement MongoDB queries)
│   └── dashboard.service.ts # Returns mock data (TODO: implement MongoDB queries)
├── routes/
│   └── auth.routes.ts   # GitHub OAuth routes
├── middleware/
│   └── auth.ts          # JWT auth middleware (MongoDB compatible)
└── .env.backend         # Environment config (MONGO_URI)
```

## 🔐 User Schema

```typescript
{
  email: string (required, unique)
  name?: string
  avatar_url?: string
  github_id?: string (unique)
  github_login?: string
  github_avatar?: string
  github_access_token?: string (encrypted)
  github_connected: boolean
  github_profile_url?: string
  github_public_repos?: number
  github_followers?: number
  github_following?: number
  github_connected_at?: Date
  created_at: Date
  updated_at: Date
}
```

## 🔄 OAuth Flow Diagram

```
Frontend (localhost:3000)
    ↓
    | User clicks "Connect GitHub"
    ↓
Backend /api/auth/github (localhost:4000)
    ↓
    | Generates state token, redirects to GitHub
    ↓
GitHub Authorization Page
    ↓
    | User authorizes
    ↓
Backend /api/auth/github/callback (localhost:4000)
    ↓
    | 1. Validates state token
    | 2. Exchanges code for access token
    | 3. Fetches GitHub user profile
    | 4. Creates/updates user in MongoDB
    | 5. Sets JWT cookie
    ↓
Frontend /dashboard (localhost:3000)
    ✅ User authenticated with GitHub connected
```

## ⚠️ Important Notes

1. **MongoDB Connection**: The backend will start even if MongoDB is not connected (logs a warning). Make sure to configure `MONGO_URI` properly.

2. **GitHub OAuth Callback**: Your GitHub OAuth App **must** have the callback URL set to `http://localhost:4000/api/auth/github/callback` (backend port, not frontend).

3. **Dashboard Analytics**: Currently returns mock data. MongoDB queries for reviews, pull requests, and analytics need to be implemented in `backend/services/dashboard.service.ts` and `backend/services/database.service.ts`.

4. **Token Encryption**: GitHub access tokens are encrypted using AES with the `ENCRYPTION_KEY` from `.env.backend`.

## 🐛 Troubleshooting

**"Page Not Found" after GitHub authorization:**
- Check that your GitHub OAuth callback URL is `http://localhost:4000/api/auth/github/callback`
- Verify backend is running on port 4000
- Check backend logs for errors

**"MongoDB connection failed":**
- Verify `MONGO_URI` is correct in `backend/.env.backend`
- For MongoDB Atlas, ensure your IP is whitelisted
- Check database user credentials

**"Invalid state parameter":**
- Clear browser cookies
- Try the OAuth flow again
- Check that cookies are enabled

## 📝 Next Steps (TODO)

1. Implement MongoDB queries in `backend/services/dashboard.service.ts`
2. Implement MongoDB queries in `backend/services/database.service.ts`
3. Create MongoDB models for:
   - Repositories
   - Pull Requests
   - Reviews
   - Settings
4. Add indexes to MongoDB collections for performance
5. Implement proper error handling for MongoDB operations
