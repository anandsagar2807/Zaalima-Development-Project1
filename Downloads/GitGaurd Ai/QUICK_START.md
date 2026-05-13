# 🚀 Quick Start Guide - GitGuard AI

## ⚡ 3-Step Setup

### 1️⃣ Configure MongoDB (Choose One)

**Option A: MongoDB Atlas (Recommended - Free)**
```bash
# 1. Go to https://cloud.mongodb.com/
# 2. Sign up/Login → Create FREE cluster
# 3. Database Access → Add User (username + password)
# 4. Network Access → Add IP (0.0.0.0/0 for development)
# 5. Connect → Get connection string
```

**Update `backend/.env.backend`:**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gitguard_ai?retryWrites=true&w=majority
```

**Option B: Local MongoDB**
```bash
# Install MongoDB locally, then:
MONGO_URI=mongodb://localhost:27017/gitguard_ai
```

---

### 2️⃣ Create GitHub OAuth App

1. **Go to:** https://github.com/settings/developers
2. **Click:** "New OAuth App"
3. **Fill in:**
   - Application name: `GitGuard AI Local`
   - Homepage URL: `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:4000/api/auth/github/callback` ⚠️ **IMPORTANT: Port 4000 (backend)**
4. **Click:** "Register application"
5. **Copy credentials** to `backend/.env.backend`:

```env
GITHUB_CLIENT_ID=Ov23li...
GITHUB_CLIENT_SECRET=05f4e3...
GITHUB_CALLBACK_URL=http://localhost:4000/api/auth/github/callback
```

---

### 3️⃣ Start Servers

**Terminal 1 - Backend:**
```bash
npm run dev:backend
# ✅ Backend running on http://localhost:4000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# ✅ Frontend running on http://localhost:3000
```

---

## ✅ Test OAuth Flow

1. Open browser: http://localhost:3000
2. Click "Connect GitHub" button
3. Authorize on GitHub
4. ✅ Redirected to dashboard with GitHub connected!

---

## 🔍 Verify Setup

**Check Backend Health:**
```bash
curl http://localhost:4000/health
# Expected: {"status":"ok","timestamp":"..."}
```

**Check MongoDB Connection:**
- Backend logs should show: `MongoDB connected successfully`
- If not connected: Check `MONGO_URI` in `backend/.env.backend`

**Check GitHub OAuth:**
- GitHub OAuth App callback URL must be: `http://localhost:4000/api/auth/github/callback`
- Check `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `backend/.env.backend`

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Page Not Found" after GitHub auth | Check GitHub OAuth callback URL is `http://localhost:4000/api/auth/github/callback` |
| "MongoDB connection failed" | Verify `MONGO_URI` in `backend/.env.backend`. For Atlas, whitelist your IP. |
| "Invalid state parameter" | Clear browser cookies and try again |
| Backend won't start | Check port 4000 is not in use |
| Frontend won't start | Check port 3000 is not in use |

---

## 🔄 OAuth Flow

```
1. User clicks "Connect GitHub" on frontend (localhost:3000)
   ↓
2. Frontend → Backend: GET http://localhost:4000/api/auth/github
   ↓
3. Backend → GitHub: Redirect to authorization page
   ↓
4. User authorizes on GitHub
   ↓
5. GitHub → Backend: GET http://localhost:4000/api/auth/github/callback?code=...
   ↓
6. Backend:
   - Exchanges code for access token
   - Fetches GitHub user profile
   - Creates/updates user in MongoDB
   - Sets JWT cookie
   ↓
7. Backend → Frontend: Redirect to http://localhost:3000/dashboard?github_connected=true
   ↓
8. ✅ User authenticated with GitHub connected!
```

---

## 📝 Environment Variables

**Required in `backend/.env.backend`:**
```env
MONGO_URI=mongodb+srv://...  # ⚠️ REQUIRED
GITHUB_CLIENT_ID=Ov23li...   # ⚠️ REQUIRED
GITHUB_CLIENT_SECRET=05f4e3... # ⚠️ REQUIRED
```
