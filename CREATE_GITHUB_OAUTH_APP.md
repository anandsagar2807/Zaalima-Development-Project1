# 🔧 CREATE NEW GITHUB OAUTH APP

**Issue:** GitHub OAuth App (2738619) not found  
**Solution:** Create a new OAuth App  
**Time Required:** 5 minutes  

---

## 📝 STEP-BY-STEP GUIDE

### Step 1: Go to GitHub OAuth Apps Page

Open this URL in your browser:
```
https://github.com/settings/developers
```

Or navigate manually:
1. Click your profile picture (top right)
2. Click "Settings"
3. Scroll down to "Developer settings" (bottom left)
4. Click "OAuth Apps"

---

### Step 2: Click "New OAuth App"

You'll see a button that says **"New OAuth App"** or **"Register a new application"**

Click it!

---

### Step 3: Fill in the Application Details

Use these **EXACT** values:

| Field | Value |
|-------|-------|
| **Application name** | `GitGuard AI` |
| **Homepage URL** | `http://localhost:3000` |
| **Application description** | `AI-Powered Pull Request Review Tool` (optional) |
| **Authorization callback URL** | `http://localhost:4000/api/auth/github/callback` |

⚠️ **CRITICAL:** The callback URL must be **EXACTLY:**
```
http://localhost:4000/api/auth/github/callback
```

---

### Step 4: Click "Register application"

After clicking, you'll see your new OAuth App page with:
- **Client ID** (visible)
- **Client secrets** section (click "Generate a new client secret")

---

### Step 5: Generate Client Secret

1. Click **"Generate a new client secret"**
2. **IMPORTANT:** Copy the secret immediately (you won't see it again!)
3. Save it somewhere safe

---

### Step 6: Update Your .env.backend File

Replace the old credentials with your new ones:

**File:** `backend/.env.backend`

```env
# GitHub OAuth Configuration
GITHUB_CLIENT_ID=<your-new-client-id>
GITHUB_CLIENT_SECRET=<your-new-client-secret>
GITHUB_CALLBACK_URL=http://localhost:4000/api/auth/github/callback
```

**Example:**
```env
GITHUB_CLIENT_ID=Ov23liABCDEF1234567890
GITHUB_CLIENT_SECRET=1234567890abcdef1234567890abcdef12345678
GITHUB_CALLBACK_URL=http://localhost:4000/api/auth/github/callback
```

---

### Step 7: Update Frontend .env.frontend

**File:** `.env.frontend`

```env
NEXT_PUBLIC_GITHUB_CLIENT_ID=Ov23lieDJq9lEOP7aoZO
```

---

### Step 8: Restart Backend Server

```bash
# Stop the current backend (Ctrl+C in the terminal)
# Then restart:
cd backend
npm run dev
```

---

### Step 9: Test OAuth Flow

1. Open: http://localhost:3000/connect-github
2. Click "Authorize GitHub"
3. Should redirect to GitHub authorization page
4. Approve the app
5. Should redirect back to dashboard

---

## 🎯 QUICK REFERENCE

### GitHub OAuth App Settings

| Setting | Value |
|---------|-------|
| Application name | `GitGuard AI` |
| Homepage URL | `http://localhost:3000` |
| Authorization callback URL | `http://localhost:4000/api/auth/github/callback` |

### Scopes (Automatically Requested)

Your app will request these scopes:
- `read:user` - Read user profile
- `user:email` - Read email addresses
- `repo` - Access repositories
- `read:org` - Read organization membership

---

## 🔍 VISUAL GUIDE

### What the GitHub OAuth App Form Looks Like:

```
┌─────────────────────────────────────────────────────────────┐
│ Register a new OAuth application                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Application name *                                           │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ GitGuard AI                                         │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                              │
│ Homepage URL *                                               │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ http://localhost:3000                               │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                              │
│ Application description (optional)                           │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ AI-Powered Pull Request Review Tool                 │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                              │
│ Authorization callback URL *                                 │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ http://localhost:4000/api/auth/github/callback      │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                              │
│ [ Register application ]                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚠️ COMMON MISTAKES TO AVOID

### 1. Wrong Callback URL
```
❌ http://localhost:3000/api/auth/github/callback  (frontend port)
❌ http://localhost:4000/auth/github/callback      (missing /api)
❌ http://localhost:4000/api/auth/github/callback/ (trailing slash)
✅ http://localhost:4000/api/auth/github/callback  (CORRECT)
```

### 2. Forgetting to Copy Client Secret
- You can only see the client secret **once** after generation
- If you lose it, you'll need to generate a new one

### 3. Not Restarting Backend
- After updating .env.backend, you **must** restart the backend server
- Otherwise it will still use the old credentials

---

## 🧪 TESTING CHECKLIST

After creating the OAuth App:

- [ ] Created new OAuth App on GitHub
- [ ] Copied Client ID
- [ ] Generated and copied Client Secret
- [ ] Updated `backend/.env.backend` with new credentials
- [ ] Updated `.env.frontend` with new Client ID
- [ ] Restarted backend server
- [ ] Tested OAuth flow at http://localhost:3000/connect-github
- [ ] Successfully authorized on GitHub
- [ ] Redirected back to dashboard
- [ ] No errors in console

---

## 🎓 UNDERSTANDING OAUTH APPS

### What is a GitHub OAuth App?

A GitHub OAuth App allows your application to:
- Authenticate users via GitHub
- Access user data (with permission)
- Perform actions on behalf of users

### Why Do You Need One?

Without an OAuth App, you can't:
- Let users sign in with GitHub
- Access their repositories
- Post comments on pull requests
- Fetch user profile information

### Security

- **Client ID:** Public (can be in frontend code)
- **Client Secret:** Private (must be kept secret, backend only)
- **Callback URL:** Must match exactly for security

---

## 🚀 AFTER CREATING THE APP

Once you've created the OAuth App and updated your credentials:

1. **Test the flow:**
   ```
   http://localhost:3000/connect-github
   ```

2. **Verify it works:**
   - No "redirect_uri" errors
   - Successfully redirects to GitHub
   - Successfully redirects back to dashboard

3. **Check backend logs:**
   ```
   Should see: "GitHub OAuth completed successfully"
   ```

---

## 📞 TROUBLESHOOTING

### "Application not found" error
- Make sure you're logged into the correct GitHub account
- Check if you have permission to create OAuth Apps

### "Callback URL mismatch" error
- Double-check the callback URL is exactly:
  `http://localhost:4000/api/auth/github/callback`
- No trailing slash
- Correct port (4000, not 3000)
- Includes `/api` prefix

### "Invalid client" error
- Check Client ID and Secret are correct in .env.backend
- Make sure you restarted the backend server

---

## 🎉 SUMMARY

**What to do:**
1. Go to: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in the form with values above
4. Generate client secret
5. Update .env.backend and .env.frontend
6. Restart backend server
7. Test OAuth flow

**Callback URL (CRITICAL):**
```
http://localhost:4000/api/auth/github/callback
```

**After this, your OAuth integration will work perfectly!** 🚀

---

## 📝 NEED HELP?

If you get stuck:
1. Make sure you're logged into GitHub
2. Check you have permission to create OAuth Apps
3. Verify all URLs are correct (no typos)
4. Restart backend after updating credentials
5. Check browser console for errors
6. Check backend logs for errors

**Let me know once you've created the OAuth App and I'll help you test it!**
