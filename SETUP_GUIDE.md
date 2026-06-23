# GitGuard AI - Environment Configuration Guide

## Backend Environment Variables

The backend uses `backend/.env.backend` for configuration.

### Required Configuration

1. **MongoDB Connection**
   ```
   MONGO_URI=mongodb://localhost:27017/gitguard_ai
   ```
   For MongoDB Atlas, use:
   ```
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/gitguard_ai?retryWrites=true&w=majority
   ```

2. **GitHub OAuth**
   - Go to https://github.com/settings/developers
   - Create a new OAuth App
   - Set Authorization callback URL to: `http://localhost:4000/api/auth/github/callback`
   - Copy your credentials:
   ```
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   GITHUB_CALLBACK_URL=http://localhost:4000/api/auth/github/callback
   ```

3. **Frontend URL**
   ```
   FRONTEND_URL=http://localhost:3000
   ```

### OAuth Flow

The correct OAuth flow is:
1. User clicks "Connect GitHub" on frontend (http://localhost:3000)
2. Frontend redirects to backend: `http://localhost:4000/api/auth/github`
3. Backend redirects to GitHub authorization page
4. User authorizes on GitHub
5. GitHub redirects back to: `http://localhost:4000/api/auth/github/callback`
6. Backend processes OAuth, creates/updates user in MongoDB
7. Backend redirects to: `http://localhost:3000/dashboard?github_connected=true`

### Starting the Backend

```bash
npm run dev:backend
```

The backend will run on http://localhost:4000
