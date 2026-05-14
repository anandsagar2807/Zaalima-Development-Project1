# 🧪 GitGuard AI - Manual Testing Instructions

## ✅ SERVERS ARE RUNNING

Both servers are currently active and ready for testing:

- **Frontend:** http://localhost:3000 ✅
- **Backend:** http://localhost:4000 ✅
- **MongoDB:** Connected ✅

---

## 🎯 STEP-BY-STEP TESTING GUIDE

### 1️⃣ Test Homepage & Auto GitHub OAuth Popup

**Action:**
```
Open your browser and navigate to: http://localhost:3000
```

**Expected Behavior:**
- Homepage loads with GitGuard AI branding
- After 1 second, you should be automatically redirected to GitHub OAuth
- If not authenticated, the OAuth popup/redirect triggers automatically

**What to Verify:**
- ✅ Page loads successfully
- ✅ Auto-redirect happens after 1 second
- ✅ You're taken to GitHub authorization page

---

### 2️⃣ Test GitHub OAuth Authorization

**Expected URL Pattern:**
```
https://github.com/login/oauth/authorize?client_id=Ov23lieDJq9lEOP7aoZO&redirect_uri=http://localhost:4000/api/auth/github/callback&scope=read:user+user:email+repo+read:org&state=...
```

**Action:**
- Click "Authorize" on GitHub's authorization page

**Expected Behavior:**
- GitHub redirects to: `http://localhost:4000/api/auth/github/callback?code=...&state=...`
- Backend processes the callback
- User data is stored in MongoDB
- JWT token is set in httpOnly cookie
- Redirects to: `http://localhost:3000/dashboard?github_connected=true`

**What to Verify:**
- ✅ Authorization page shows correct app name
- ✅ Scopes requested: read:user, user:email, repo, read:org
- ✅ After authorization, redirects to dashboard
- ✅ Success message appears: "GitHub account connected successfully!"

---

### 3️⃣ Test Dashboard

**Action:**
```
Navigate to: http://localhost:3000/dashboard
```

**Expected Behavior:**
- Dashboard loads with analytics data
- Charts display (PRs per day, Issues by severity, Issues distribution)
- Stats cards show numbers

**What to Verify:**
- ✅ Dashboard loads without errors
- ✅ Analytics data displays
- ✅ Charts render correctly
- ✅ Auto-refresh notice at bottom

---

### 4️⃣ Test Repositories Page (Real GitHub Data)

**Action:**
```
Navigate to: http://localhost:3000/dashboard/repositories
```

**Expected Behavior:**
- Fetches YOUR actual GitHub repositories
- Displays repository cards with:
  - Repository name
  - Description
  - Language
  - Stars, forks, issues count
  - Last updated date

**What to Verify:**
- ✅ Your real GitHub repositories appear
- ✅ Repository data is accurate
- ✅ No static/mock data
- ✅ Can see public and private repos (if authorized)

---

### 5️⃣ Test Pull Requests Page (Real GitHub Data)

**Action:**
```
Navigate to: http://localhost:3000/dashboard/pull-requests
```

**Expected Behavior:**
- Fetches YOUR actual pull requests from your repositories
- Displays PR cards with:
  - PR title
  - Repository name
  - Author
  - Status (open/merged/closed)
  - Branch name
  - Created date

**What to Verify:**
- ✅ Your real pull requests appear
- ✅ PR data is accurate
- ✅ Shows PRs from multiple repositories
- ✅ Status indicators work correctly

---

### 6️⃣ Test AI Reviews (OpenRouter Integration)

**Action:**
```
Navigate to: http://localhost:3000/dashboard/ai-reviews
```

**Alternative - Direct API Test:**
```bash
# Replace with your actual repo and PR number
curl "http://localhost:4000/api/reviews?repo=owner/repo&prNumber=123" \
  -H "Cookie: token=YOUR_JWT_TOKEN"
```

**Expected Behavior:**
- If you have PRs, you can request AI analysis
- OpenRouter API analyzes the PR diff
- Returns structured review with:
  - Security issues
  - Bug detection
  - Performance suggestions
  - Code style feedback

**What to Verify:**
- ✅ AI review endpoint responds
- ✅ Analysis is structured and readable
- ✅ Suggestions are actionable

---

### 7️⃣ Test Authentication Flow

**Action:**
```
1. Click "Logout" or navigate to settings
2. Logout from the application
3. Visit homepage again
```

**Expected Behavior:**
- After logout, cookies are cleared
- Visiting homepage triggers OAuth popup again
- Can re-authenticate successfully

**What to Verify:**
- ✅ Logout clears session
- ✅ Can re-authenticate
- ✅ User data persists in MongoDB

---

## 🔍 BACKEND API TESTING

### Test Endpoints Directly

**1. Health Check:**
```bash
curl http://localhost:4000/health
# Expected: {"status":"ok","timestamp":"..."}
```

**2. GitHub OAuth Initiation:**
```bash
curl -I http://localhost:4000/api/auth/github
# Expected: 302 redirect to GitHub
```

**3. Dashboard Summary:**
```bash
curl http://localhost:4000/api/dashboard/summary-test
# Expected: Full dashboard JSON data
```

**4. Test with Authentication:**
```bash
# After logging in, get your JWT token from browser cookies
# Then test authenticated endpoints:

curl http://localhost:4000/api/auth/me \
  -H "Cookie: token=YOUR_JWT_TOKEN"

curl http://localhost:4000/api/github/repos \
  -H "Cookie: token=YOUR_JWT_TOKEN"
```

---

## 🐛 TROUBLESHOOTING

### Issue: OAuth Popup Doesn't Trigger
**Solution:**
- Check browser console for errors
- Verify you're not already authenticated
- Clear browser cookies and try again

### Issue: "GitHub account not connected" Error
**Solution:**
- Complete the OAuth flow first
- Check if JWT token is set in cookies
- Verify MongoDB connection

### Issue: No Repositories/PRs Showing
**Solution:**
- Ensure you have repositories in your GitHub account
- Check if OAuth scopes include `repo` access
- Verify GitHub token is valid

### Issue: AI Reviews Not Working
**Solution:**
- Verify OpenRouter API key in `.env.backend`
- Check `LLM_API_KEY` is set correctly
- Review backend logs for API errors

---

## 📊 VERIFICATION CHECKLIST

After testing, verify these items:

- [ ] Homepage loads successfully
- [ ] GitHub OAuth auto-popup triggers
- [ ] Can authorize on GitHub
- [ ] Redirects to dashboard after auth
- [ ] Dashboard displays analytics
- [ ] Repositories page shows real GitHub repos
- [ ] Pull requests page shows real PRs
- [ ] AI reviews endpoint responds
- [ ] Can logout successfully
- [ ] Can re-authenticate
- [ ] MongoDB stores user data
- [ ] JWT tokens work correctly
- [ ] CORS allows frontend-backend communication
- [ ] Rate limiting is active

---

## 🎉 SUCCESS CRITERIA

Your application is working correctly if:

1. ✅ Auto GitHub OAuth popup triggers on homepage
2. ✅ OAuth flow completes successfully
3. ✅ Dashboard displays your data
4. ✅ Repositories page shows YOUR actual GitHub repos
5. ✅ Pull requests page shows YOUR actual PRs
6. ✅ All API endpoints respond correctly
7. ✅ MongoDB stores user information
8. ✅ Can logout and re-authenticate

---

## 📝 NOTES

- **Servers are currently running** - No need to restart
- **MongoDB is connected** - User data will persist
- **OpenRouter AI is configured** - Ready for PR analysis
- **All endpoints are tested** - Backend is fully functional

**Current Status:** 🟢 ALL SYSTEMS OPERATIONAL

Open http://localhost:3000 in your browser to start testing!
