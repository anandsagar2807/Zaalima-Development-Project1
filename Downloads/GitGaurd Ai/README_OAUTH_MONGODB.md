# GitGuard AI - OAuth & MongoDB Setup

## ✅ Completed Tasks

### Database Migration
- [x] Removed PostgreSQL (pg, @types/pg)
- [x] Installed Mongoose
- [x] Created MongoDB User model
- [x] Created MongoDB Log model
- [x] Updated database connection
- [x] Refactored user service
- [x] Updated auth middleware

### GitHub OAuth
- [x] Fixed callback URL mismatch
- [x] Implemented proper OAuth flow
- [x] Added state token CSRF protection
- [x] User creation/update in MongoDB
- [x] JWT token generation
- [x] Proper redirect handling

---

## 🔧 Configuration Required

### 1. MongoDB Setup

**Option A: MongoDB Atlas (Free)**
1. Visit https://cloud.mongodb.com/
2. Create free cluster
3. Add database user
4. Whitelist IP: 0.0.0.0/0
5. Get connection string

**Option B: Local MongoDB**
```bash
# Install MongoDB, then use:
mongodb://localhost:27017/gitguard_ai
```

**Update `backend/.env.backend`:**
```env
MONGO_URI=your_mongodb_connection_string
```

### 2. GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - Name: GitGuard AI Local
   - Homepage: http://localhost:3000
   - **Callback: http://localhost:4000/api/auth/github/callback**
4. Copy credentials to `backend/.env.backend`:

```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=http://localhost:4000/api/auth/github/callback
```

---

## 🚀 Running the Application

```bash
# Terminal 1 - Backend (port 4000)
npm run dev:backend

# Terminal 2 - Frontend (port 3000)
npm run dev
```

---

## 🧪 Testing OAuth

1. Open http://localhost:3000
2. Click "Connect GitHub"
3. Authorize on GitHub
4. You'll be redirected to dashboard with GitHub connected

---

## 📂 Project Structure

```
backend/
├── models/
│   ├── User.ts              # MongoDB User schema
│   └── Log.ts               # MongoDB Log schema
├── config/
│   ├── database.ts          # MongoDB connection (Mongoose)
│   └── env.ts               # Environment config (mongoUri)
├── services/
│   ├── user.service.ts      # User CRUD (Mongoose)
│   ├── database.service.ts  # Review storage (stub)
│   └── dashboard.service.ts # Analytics (mock data)
├── routes/
│   └── auth.routes.ts       # OAuth routes
├── middleware/
│   └── auth.ts              # JWT middleware
└── .env.backend             # Configuration
```

---

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

---

## 🔄 OAuth Flow

```
1. User clicks "Connect GitHub" (localhost:3000)
2. Frontend → Backend: /api/auth/github
3. Backend → GitHub: Authorization page
4. User authorizes
5. GitHub → Backend: /api/auth/github/callback?code=...
6. Backend:
   - Exchange code for token
   - Fetch GitHub profile
   - Create/update user in MongoDB
   - Set JWT cookie
7. Backend → Frontend: /dashboard?github_connected=true
8. ✅ Success!
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Page Not Found" after auth | Verify callback URL: `http://localhost:4000/api/auth/github/callback` |
| MongoDB connection failed | Check MONGO_URI in backend/.env.backend |
| Invalid state parameter | Clear cookies and retry |
| Port already in use | Kill process on port 4000 or 3000 |

---

## 📝 Environment Variables

**backend/.env.backend:**
```env
# Required
MONGO_URI=mongodb+srv://...
GITHUB_CLIENT_ID=Ov23li...
GITHUB_CLIENT_SECRET=05f4e3...
GITHUB_CALLBACK_URL=http://localhost:4000/api/auth/github/callback

# Auto-configured
PORT=4000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=kfnR0zqEZHIE/puobwpiTX+F+FhxK+yUW/rUhiG69JA=
ENCRYPTION_KEY=DHtyJ7SSD6vPFtLM8j80UsMHhorCfYKVWojs88h+s5U=
```

---

## ✅ Verification Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user added
- [ ] IP whitelisted
- [ ] MONGO_URI updated in backend/.env.backend
- [ ] GitHub OAuth App created
- [ ] Callback URL set to http://localhost:4000/api/auth/github/callback
- [ ] GITHUB_CLIENT_ID updated
- [ ] GITHUB_CLIENT_SECRET updated
- [ ] Backend starts successfully (npm run dev:backend)
- [ ] Frontend starts successfully (npm run dev)
- [ ] OAuth flow tested and working

---

## 📚 Additional Documentation

- `QUICK_START.md` - Quick setup guide
- `MIGRATION_COMPLETE.md` - Full migration details
- `SETUP_GUIDE.md` - Detailed setup instructions
- `SUMMARY.md` - What was changed

---

**Ready to go! 🚀**
