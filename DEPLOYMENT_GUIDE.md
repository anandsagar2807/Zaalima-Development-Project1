# GitGuard AI — Deployment Guide (Vercel + Render)

This guide covers deploying the **frontend** to Vercel and the **backend** to Render.

---

## Architecture

```
┌─────────────────────────┐         ┌──────────────────────────────┐
│   Vercel (Frontend)     │         │   Render (Backend)            │
│   Next.js 14            │────────▶│   Express + tsx               │
│   frontend-amber-six-35.vercel.app│HTTPS│   gitgaurd-ai.onrender.com    │
│                         │         │                               │
│   Port: 443 (managed)   │         │   Port: auto (PORT env var)   │
└─────────────────────────┘         └──────────────────────────────┘
         │                                      │
         │           ┌──────────────┐           │
         └──────────▶│  GitHub OAuth │◀──────────┘
                     │  github.com   │
                     └──────────────┘
```

---

## Part 1: Deploy Backend to Render

### Step 1: Create a Web Service on Render

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `gitgaurd-ai`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm run start` (runs `tsx server.ts`)
   - **Instance Type:** Free or Starter

### Step 2: Set Environment Variables on Render

Go to your Render service → **Environment** tab and add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | *(leave empty — Render sets this automatically)* |
| `MONGO_URI` | `mongodb+srv://...` (your MongoDB Atlas URI) |
| `JWT_SECRET` | *(your JWT secret)* |
| `ENCRYPTION_KEY` | *(your encryption key)* |
| `GITHUB_CLIENT_ID` | *(your GitHub OAuth App client ID)* |
| `GITHUB_CLIENT_SECRET` | *(your GitHub OAuth App client secret)* |
| `GITHUB_CALLBACK_URL` | `https://gitgaurd-ai.onrender.com/api/auth/github/callback` |
| `FRONTEND_URL` | `https://frontend-amber-six-35.vercel.app` *(update after Vercel deploy)* |
| `GITHUB_TOKEN` | *(your GitHub PAT)* |
| `GITHUB_WEBHOOK_SECRET` | *(your webhook secret)* |
| `LLM_API_KEY` | *(your OpenRouter API key)* |
| `LLM_BASE_URL` | `https://openrouter.ai/api/v1` |
| `LLM_MODEL` | `poolside/laguna-xs.2:free` |
| `LLM_MAX_TOKENS` | `4096` |
| `LLM_TIMEOUT_MS` | `60000` |
| `LLM_MAX_DIFF_SIZE` | `50000` |
| `ENABLE_INSFORGE` | `false` |

### Step 3: Deploy

Click **Create Web Service**. Render will build and deploy.
Your backend URL will be: `https://gitgaurd-ai.onrender.com`

### Step 4: Verify

Test the health endpoint:
```
https://gitgaurd-ai.onrender.com/health
```
Should return: `{"status":"ok","timestamp":"..."}`

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Import Project on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import your GitHub repository
3. Vercel auto-detects Next.js from `frontend/` directory

### Step 2: Configure Build Settings

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` (auto-detected) |
| **Install Command** | `npm install` |

> **Note:** The `vercel.json` in the project root handles the `frontend` subdirectory configuration automatically.

### Step 3: Set Environment Variables on Vercel

Go to Vercel project → **Settings** → **Environment Variables** and add:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://gitgaurd-ai.onrender.com` | Production + Preview |
| `NEXT_PUBLIC_APP_NAME` | `GitGuard AI` | All |
| `NEXT_PUBLIC_APP_ENV` | `production` | Production |
| `NEXT_PUBLIC_GITHUB_CLIENT_ID` | *(your GitHub OAuth client ID)* | All |
| `GITHUB_CLIENT_SECRET` | *(your GitHub OAuth client secret)* | Production + Preview |
| `GITHUB_OAUTH_REDIRECT_URI` | `https://frontend-amber-six-35.vercel.app/api/connect-github/callback` | Production |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | *(your Clerk publishable key)* | All |
| `CLERK_SECRET_KEY` | *(your Clerk secret key)* | Production + Preview |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` | All |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` | All |
| `DATABASE_URL` | *(your PostgreSQL connection string)* | Production + Preview |

### Step 4: Deploy

Click **Deploy**. Vercel will build and deploy.
Your frontend URL will be: `https://frontend-amber-six-35.vercel.app`

---

## Part 3: Update GitHub OAuth App

### Update Callback URLs

Go to [GitHub OAuth Apps](https://github.com/settings/developers) → your OAuth app:

| Setting | Value |
|---------|-------|
| **Homepage URL** | `https://frontend-amber-six-35.vercel.app` |
| **Authorization callback URL** | `https://gitgaurd-ai.onrender.com/api/auth/github/callback` |

> **Important:** The callback URL must point to the **Render backend** (not Vercel),
> because the backend handles the full OAuth token exchange flow.

---

## Part 4: Update Render with Vercel URL

After your Vercel deployment is live, update the Render environment variable:

1. Go to Render → your backend service → **Environment**
2. Update `FRONTEND_URL` to your actual Vercel URL (e.g., `https://frontend-amber-six-35.vercel.app`)
3. Save and restart the service

---

## Part 5: CORS & Cookie Configuration

The following changes have been made to support cross-origin requests:

### Backend CORS (`backend/app.ts`)
- Allows requests from any `*.vercel.app` domain
- Allows the configured `FRONTEND_URL`
- Credentials enabled for cookie-based auth

### Backend Cookies (`backend/routes/auth.routes.ts`)
- `sameSite: 'none'` in production (allows cross-origin cookies)
- `secure: true` in production (required with `sameSite: 'none'`)
- `sameSite: 'lax'` in development (local dev)

---

## Troubleshooting

### CORS Errors
- Verify `FRONTEND_URL` on Render matches your Vercel domain exactly
- Check that Vercel env var `NEXT_PUBLIC_API_URL` points to `https://gitgaurd-ai.onrender.com`

### OAuth Redirect Fails
- Verify GitHub OAuth App callback URL = `https://gitgaurd-ai.onrender.com/api/auth/github/callback`
- Verify `GITHUB_CALLBACK_URL` on Render matches exactly

### Cookies Not Set (Cross-Origin)
- Backend must use `sameSite: 'none'` + `secure: true` in production
- Frontend fetch calls must include `credentials: 'include'`
- Both sites must be HTTPS (Vercel and Render are HTTPS by default)

### Build Fails on Vercel
- Ensure `frontend/package.json` does NOT contain `"gitguard-ai": "file:.."`
- Ensure `frontend/next.config.mjs` does NOT contain `experimental.externalDir`
- Ensure `frontend/tsconfig.json` does NOT contain `@backend/*` path alias

### Render Service Sleeps (Free Tier)
- Render free tier services sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- Upgrade to Starter tier for always-on service
