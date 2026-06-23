# GitGuard AI - Environment Variables

## Backend Environment Variables

Copy this file to `backend/.env` and fill in your values.

```bash
# Server Configuration
PORT=4000
NODE_ENV=development

# PostgreSQL Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gitguard_ai

# JWT & Encryption
# Generate secure keys using: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ENCRYPTION_KEY=your-super-secret-encryption-key-change-in-production

# GitHub OAuth Configuration
# Create a GitHub OAuth App at: https://github.com/settings/developers
# Authorization callback URL: http://localhost:4000/auth/github/callback
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:4000/auth/github/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173

# GitHub Personal Access Token (for webhooks and API)
# Create at: https://github.com/settings/tokens
# Required scopes: repo, read:org, admin:repo_hook
GITHUB_TOKEN=ghp_your_github_token
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# LLM Configuration (OpenAI-compatible API)
LLM_API_KEY=sk-your_llm_api_key
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
LLM_MAX_TOKENS=4096
LLM_TIMEOUT_MS=60000
LLM_MAX_DIFF_SIZE=50000

# Insforge Integration (Optional - DISABLED by default)
ENABLE_INSFORGE=false
INSFORGE_API_BASE_URL=
INSFORGE_API_KEY=
```

## Frontend Environment Variables

The frontend uses `.env.example` in the root directory.

```bash
# API Base URL (backend server)
NEXT_PUBLIC_API_URL=http://localhost:4000

# Clerk Authentication (if using Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# App Configuration
NEXT_PUBLIC_APP_NAME=GitGuard AI
NEXT_PUBLIC_APP_ENV=development
```

## Setup Instructions

### 1. Create GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - Application name: `GitGuard AI (Development)`
   - Homepage URL: `http://localhost:5173`
   - Authorization callback URL: `http://localhost:4000/auth/github/callback`
4. Click "Register application"
5. Copy the Client ID and generate a Client Secret
6. Add them to your `backend/.env` file

### 2. Create GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes:
   - `repo` (Full control of private repositories)
   - `read:org` (Read org and team membership)
   - `admin:repo_hook` (Full control of repository hooks)
4. Generate and copy the token
5. Add it to `GITHUB_TOKEN` in `backend/.env`

### 3. Setup Database

```bash
# Create PostgreSQL database
createdb gitguard_ai

# Run migrations (if you have them)
npm run migrate
```

### 4. Generate Secure Keys

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate encryption key
openssl rand -base64 32
```

Add these to your `backend/.env` file.

### 5. Start the Application

```bash
# Terminal 1 - Start backend
npm run dev:backend

# Terminal 2 - Start frontend
npm run dev
```

## Production Configuration

For production deployment:

1. Set `NODE_ENV=production`
2. Use strong, unique secrets for JWT and encryption
3. Use HTTPS URLs for all endpoints
4. Update GitHub OAuth callback URL to production domain
5. Enable secure cookies (`secure: true` in cookie options)
6. Set up proper CORS origins
7. Use environment-specific database URLs
8. Enable rate limiting and security headers

## Troubleshooting

### OAuth Callback Issues

- Ensure `GITHUB_CALLBACK_URL` matches exactly what's configured in GitHub OAuth app
- Check that `FRONTEND_URL` is correct for redirects
- Verify ports are not blocked by firewall

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check database exists: `psql -l`
- Verify connection string format

### API Connection Issues

- Ensure backend is running on correct port
- Check `NEXT_PUBLIC_API_URL` matches backend URL
- Verify CORS is configured correctly in backend
