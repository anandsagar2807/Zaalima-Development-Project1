# GitHub OAuth Integration - Complete Setup Guide

## Overview

This guide walks you through setting up the complete GitHub OAuth integration for GitGuard AI, enabling users to connect their GitHub accounts and access their repositories dynamically.

## Architecture

```
User clicks "Authorize GitHub"
    ↓
Frontend redirects to Backend OAuth endpoint
    ↓
Backend redirects to GitHub OAuth
    ↓
User authorizes on GitHub
    ↓
GitHub redirects to Backend callback
    ↓
Backend exchanges code for access token
    ↓
Backend stores encrypted token in database
    ↓
Backend creates/updates user session
    ↓
Backend redirects to Frontend success page
    ↓
Frontend fetches repositories from Backend
    ↓
Backend uses stored token to fetch from GitHub API
```

## Backend Implementation

### 1. OAuth Flow Endpoints

**File: `backend/routes/auth.routes.ts`**

- `GET /auth/github` - Initiates OAuth flow
- `GET /auth/github/callback` - Handles OAuth callback
- `GET /api/auth/me` - Returns current user info
- `POST /auth/logout` - Logs out user

### 2. GitHub API Endpoints

**File: `backend/routes/github.routes.ts`**

- `GET /api/github/profile` - Fetches GitHub profile
- `GET /api/github/repos` - Fetches repositories with pagination, search, sort
- `POST /api/github/disconnect` - Disconnects GitHub account
- `POST /api/github/sync` - Syncs GitHub profile data

### 3. Security Features

- **CSRF Protection**: State token validation
- **Token Encryption**: Access tokens encrypted before storage
- **Secure Cookies**: HttpOnly, SameSite cookies for JWT
- **Token Expiration**: Automatic detection and re-auth prompt
- **Rate Limiting**: API rate limiting middleware

## Frontend Implementation

### 1. Store Management

**File: `src/store/githubStore.ts`**

Manages:
- Repository data with pagination
- Search, filter, and sort state
- GitHub profile data
- Loading and error states
- API calls to backend

**File: `src/store/authStore.ts`**

Manages:
- User authentication state
- GitHub connection status
- Session management
- OAuth flow initiation

### 2. UI Components

**File: `src/components/AuthorizeGithubButton.tsx`**
- Displays "Authorize GitHub" button
- Shows connection status
- Handles OAuth initiation

**File: `src/components/repositories/RepositoryList.tsx`**
- Displays repositories in grid/list
- Loading skeletons
- Empty and error states
- Pagination controls

**File: `src/components/repositories/RepositoryCard.tsx`**
- Individual repository card
- Shows name, description, stats
- Visibility badge (public/private)
- External link to GitHub

**File: `src/components/repositories/RepositoryFilters.tsx`**
- Search input
- Sort dropdown (updated, created, name)
- Type filter (all, owner, public, private)

### 3. Pages

**File: `src/pages/ConnectGitHubPage.tsx`**
- Intermediate loading page during OAuth
- Handles OAuth errors
- Redirects on success/failure

**File: `src/pages/GitHubConnectedPage.tsx`**
- Success confirmation page
- Displays connected user info
- Auto-fetches repositories
- Redirects to repositories page

**File: `src/pages/dashboard/RepositoriesPage.tsx`**
- Main repositories page
- Shows connection prompt if not connected
- Displays RepositoryList when connected

**File: `src/pages/dashboard/IntegrationsPage.tsx`**
- GitHub integration management
- Profile display with stats
- Sync and disconnect options

## Features Implemented

### ✅ OAuth 2.0 Authentication
- Secure GitHub OAuth flow
- State token CSRF protection
- Automatic token refresh detection

### ✅ Dynamic Repository Fetching
- Real-time data from GitHub API
- No hardcoded/mock data
- Pagination support (30 repos per page)

### ✅ Search & Filters
- Search by repository name/description
- Sort by: updated, created, pushed, name
- Filter by: all, owner, public, private, member

### ✅ Repository Display
- Repository cards with metadata
- Language, stars, forks, last updated
- Public/private visibility badges
- Direct links to GitHub

### ✅ Profile Management
- GitHub profile display
- Follower/following counts
- Repository count
- Sync profile data
- Disconnect option

### ✅ Error Handling
- Token expiration detection
- API failure handling
- User-friendly error messages
- Retry mechanisms

### ✅ Loading States
- Skeleton loaders
- Spinner animations
- Progress indicators

### ✅ Empty States
- No repositories found
- Not connected prompt
- Clear call-to-action

### ✅ Security
- Encrypted token storage
- HttpOnly cookies
- CSRF protection
- Rate limiting

## API Endpoints Summary

### Authentication
```
GET  /auth/github                    - Start OAuth flow
GET  /auth/github/callback           - OAuth callback
GET  /api/auth/me                    - Get current user
POST /auth/logout                    - Logout
```

### GitHub Integration
```
GET  /api/github/profile             - Get GitHub profile
GET  /api/github/repos               - Get repositories
     ?page=1&per_page=30&sort=updated&type=all&search=query
POST /api/github/disconnect          - Disconnect GitHub
POST /api/github/sync                - Sync profile
```

## Environment Variables Required

### Backend (`backend/.env`)
```bash
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=http://localhost:4000/auth/github/callback
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
DATABASE_URL=postgresql://...
```

### Frontend (`.env`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Testing the Integration

### 1. Start Services
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev
```

### 2. Test OAuth Flow
1. Navigate to `http://localhost:5173/dashboard/integrations`
2. Click "Authorize GitHub"
3. Authorize on GitHub
4. Verify redirect to success page
5. Check repositories page loads

### 3. Test Repository Features
1. Search for repositories
2. Change sort order
3. Apply filters
4. Navigate pagination
5. Click external links

### 4. Test Profile Management
1. View profile stats
2. Click "Sync" to refresh data
3. Test "Disconnect" functionality

## Troubleshooting

### OAuth Callback Fails
- Verify `GITHUB_CALLBACK_URL` matches GitHub OAuth app settings
- Check `FRONTEND_URL` is correct
- Ensure backend is running on correct port

### Repositories Not Loading
- Check GitHub token is valid
- Verify user has repositories
- Check browser console for errors
- Verify API URL is correct

### Token Expired Errors
- User needs to reconnect GitHub
- Check token encryption/decryption
- Verify database stores token correctly

## Next Steps

### Enhancements
- [ ] Repository detail page with commits, branches
- [ ] Webhook integration for real-time updates
- [ ] Repository settings (enable/disable features)
- [ ] Bulk operations on repositories
- [ ] Export repository data
- [ ] Advanced filtering (by language, stars range)
- [ ] Repository analytics dashboard

### Performance
- [ ] Implement caching layer
- [ ] Add request debouncing
- [ ] Optimize pagination
- [ ] Add virtual scrolling for large lists

### Security
- [ ] Add 2FA support
- [ ] Implement token rotation
- [ ] Add audit logging
- [ ] Enhanced rate limiting per user

## Conclusion

The GitHub OAuth integration is now fully functional with:
- ✅ Secure OAuth 2.0 flow
- ✅ Dynamic repository fetching
- ✅ Search, filter, and sort capabilities
- ✅ Profile management
- ✅ Error handling and loading states
- ✅ Clean, modern UI with dark/light mode support

All data is fetched dynamically from GitHub API with no hardcoded values.
