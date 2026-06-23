# 🎯 COMPLETE STEP-BY-STEP GUIDE - GitHub OAuth Setup

**Time Required:** 10 minutes  
**Difficulty:** Easy  
**Status:** Ready to follow  

---

## 📋 WHAT YOU NEED TO DO

You need to:
1. Create a GitHub OAuth App (5 minutes)
2. Copy the credentials (1 minute)
3. Update your .env files (2 minutes)
4. Restart backend server (1 minute)
5. Test the OAuth flow (1 minute)

**I cannot do steps 1-2 for you** because they require access to your GitHub account.

---

## 🚀 STEP-BY-STEP INSTRUCTIONS

### ✅ STEP 1: Create GitHub OAuth App (5 minutes)

**1.1 Open this link in your browser:**
```
https://github.com/settings/developers
```

**1.2 Click the green button:** "New OAuth App"

**1.3 Fill in the form with these EXACT values:**

| Field | Value to Enter |
|-------|----------------|
| Application name | `GitGuard AI` |
| Homepage URL | `http://localhost:3000` |
| Application description | `AI-Powered Pull Request Review Tool` (optional) |
| Authorization callback URL | `http://localhost:4000/api/auth/github/callback` |

**1.4 Click:** "Register application" (green button)

---

### ✅ STEP 2: Copy Your Credentials (1 minute)

**2.1 Copy Client ID:**

After creating the app, you'll see:
```
Client ID: Ov23liXXXXXXXXXXXXXX
```

**Copy this entire string** and save it in a notepad.

**2.2 Generate and Copy Client Secret:**

Click the button: "Generate a new client secret"

You'll see a long secret like:
```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **IMPORTANT:** Copy this **immediately**! You won't see it again!

**Save it in your notepad** next to the Client ID.

---

### ✅ STEP 3: Update Environment Files (2 minutes)

Now I'll help you update the files automatically.

**Option A: Manual Update (Recommended)**

**3.1 Update `backend/.env.backend`:**

Open the file: `backend/.env.backend`

Find these lines (around line 20-21):
```env
GITHUB_CLIENT_ID=Ov23lieDJq9lEOP7aoZO
GITHUB_CLIENT_SECRET=40436febbdcbb4e0f657cbf98cbeb7a72688441c
```

Replace with your new credentials:
```env
GITHUB_CLIENT_ID=<paste-your-client-id>
GITHUB_CLIENT_SECRET=<paste-your-client-secret>
```

**3.2 Update `.env.frontend`:**

Open the file: `.env.frontend`

Find this line (around line 11):
```env
NEXT_PUBLIC_GITHUB_CLIENT_ID=Ov23lieDJq9lEOP7aoZO
```

Replace with your new Client ID:
```env
NEXT_PUBLIC_GITHUB_CLIENT_ID=<paste-your-client-id>
```

**Save both files!**

---

**Option B: Automated Script (Alternative)**

I've created a script for you. Run this in your terminal:

```bash
# Make the script executable
chmod +x update-oauth-credentials.sh

# Run the script
./update-oauth-credentials.sh
```

Then paste your Client ID and Client Secret when prompted.

---

### ✅ STEP 4: Restart Backend Server (1 minute)

**4.1 Stop the current backend:**

In the terminal where backend is running, press: `Ctrl+C`

**4.2 Restart the backend:**

```bash
cd backend
npm run dev
```

Wait for it to say: "Backend server started"

---

### ✅ STEP 5: Test OAuth Flow (1 minute)

**5.1 Open your browser:**
```
http://localhost:3000/connect-github
```

**5.2 Click:** "Authorize GitHub"

**5.3 You should see:**
- GitHub authorization page (no warning!)
- Your app name: "GitGuard AI"
- Requested permissions listed

**5.4 Click:** "Authorize GitGuard AI"

**5.5 Success!**
- You'll be redirected to: `http://localhost:3000/dashboard/integrations?success=true`
- You should see a success message
- Your GitHub account is now connected! ✅

---

## 🎯 VISUAL CHECKLIST

```
[ ] Step 1: Go to https://github.com/settings/developers
[ ] Step 1: Click "New OAuth App"
[ ] Step 1: Fill in application name: GitGuard AI
[ ] Step 1: Fill in homepage URL: http://localhost:3000
[ ] Step 1: Fill in callback URL: http://localhost:4000/api/auth/github/callback
[ ] Step 1: Click "Register application"

[ ] Step 2: Copy Client ID
[ ] Step 2: Click "Generate a new client secret"
[ ] Step 2: Copy Client Secret immediately

[ ] Step 3: Open backend/.env.backend
[ ] Step 3: Replace GITHUB_CLIENT_ID with your new Client ID
[ ] Step 3: Replace GITHUB_CLIENT_SECRET with your new Client Secret
[ ] Step 3: Save the file

[ ] Step 3: Open .env.frontend
[ ] Step 3: Replace NEXT_PUBLIC_GITHUB_CLIENT_ID with your new Client ID
[ ] Step 3: Save the file

[ ] Step 4: Stop backend server (Ctrl+C)
[ ] Step 4: Restart backend (cd backend && npm run dev)

[ ] Step 5: Open http://localhost:3000/connect-github
[ ] Step 5: Click "Authorize GitHub"
[ ] Step 5: Approve on GitHub
[ ] Step 5: Verify redirect to dashboard
[ ] Step 5: Success! ✅
```

---

## ⚠️ CRITICAL REMINDERS

### 1. Callback URL Must Be Exact
```
✅ CORRECT: http://localhost:4000/api/auth/github/callback
❌ WRONG:   http://localhost:3000/api/auth/github/callback (wrong port)
❌ WRONG:   http://localhost:4000/auth/github/callback (missing /api)
❌ WRONG:   http://localhost:4000/api/auth/github/callback/ (trailing slash)
```

### 2. Copy Client Secret Immediately
- You can only see it once after generation
- If you lose it, generate a new one

### 3. Restart Backend After Updating
- Changes to .env files require server restart
- Stop with Ctrl+C, then restart

---

## 🐛 TROUBLESHOOTING

### "Application not found" error
**Problem:** The OAuth App doesn't exist  
**Solution:** Follow Step 1 to create it

### "Callback URL mismatch" error
**Problem:** Callback URL in GitHub doesn't match  
**Solution:** Check it's exactly `http://localhost:4000/api/auth/github/callback`

### "Invalid client" error
**Problem:** Wrong credentials in .env files  
**Solution:** Double-check Client ID and Secret are correct

### Backend won't start
**Problem:** Syntax error in .env file  
**Solution:** Make sure no extra spaces or quotes around values

---

## 📸 WHAT YOU'LL SEE

### GitHub OAuth App Form
```
┌─────────────────────────────────────────────────────────┐
│ Register a new OAuth application                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Application name *                                       │
│ ┌─────────────────────────────────────────────────┐    │
│ │ GitGuard AI                                     │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ Homepage URL *                                           │
│ ┌─────────────────────────────────────────────────┐    │
│ │ http://localhost:3000                           │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ Authorization callback URL *                             │
│ ┌─────────────────────────────────────────────────┐    │
│ │ http://localhost:4000/api/auth/github/callback  │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ [ Register application ]                                 │
└─────────────────────────────────────────────────────────┘
```

### After Creating App
```
Client ID
Ov23liABCDEF1234567890  [Copy this!]

Client secrets
[ Generate a new client secret ]  [Click this!]

After clicking, you'll see:
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  [Copy immediately!]
```

---

## 🎉 AFTER COMPLETION

Once you complete all steps, you'll have:

✅ GitHub OAuth App created  
✅ Credentials updated in .env files  
✅ Backend server restarted  
✅ OAuth flow working perfectly  
✅ Users can connect their GitHub accounts  

---

## 📞 NEED HELP?

If you get stuck on any step:

1. **Check the callback URL** - Most common issue
2. **Verify credentials** - Make sure they're copied correctly
3. **Restart backend** - After updating .env files
4. **Check browser console** - For frontend errors
5. **Check backend logs** - For backend errors

---

## 🚀 QUICK START

**Fastest way to complete:**

1. Open: https://github.com/settings/developers
2. Click "New OAuth App"
3. Copy these values:
   - Name: `GitGuard AI`
   - Homepage: `http://localhost:3000`
   - Callback: `http://localhost:4000/api/auth/github/callback`
4. Copy Client ID and Secret
5. Update both .env files
6. Restart backend
7. Test at http://localhost:3000/connect-github

**Total time: 10 minutes** ⏱️

---

## ✅ SUMMARY

**What I've done for you:**
- ✅ Fixed duplicate route registrations
- ✅ Fixed redirect_uri in backend code
- ✅ Started both servers (frontend + backend)
- ✅ Created comprehensive documentation
- ✅ Created update script

**What you need to do:**
- [ ] Create GitHub OAuth App (5 min)
- [ ] Copy credentials (1 min)
- [ ] Update .env files (2 min)
- [ ] Restart backend (1 min)
- [ ] Test OAuth flow (1 min)

**After this, your GitHub OAuth integration will work perfectly!** 🚀

---

**Start here:** https://github.com/settings/developers

**Let me know once you've created the OAuth App and I'll help you verify it's working!**
