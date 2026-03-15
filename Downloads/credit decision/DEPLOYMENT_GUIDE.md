# CreditSense - Deployment Guide

## Quick Start Deployment

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Docker & Docker Compose (for containerized deployment)

---

## Option 1: Local Development

### Setup
```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend (in another terminal)
cd backend
npm install
npm run dev
```

Visit: `http://localhost:3000`

---

## Option 2: Docker Deployment (Recommended)

### Build & Run
```bash
# From project root
docker-compose up -d
```

Services will start:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- MongoDB: `localhost:27017`

### Stop Services
```bash
docker-compose down
```

---

## Option 3: Vercel Deployment (Frontend Only)

### Setup
1. Push code to GitHub
2. Connect to Vercel: https://vercel.com/new
3. Set environment variables:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com/api/v1
   ```
4. Deploy

---

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_NAME=Aurora Credit OS
NEXT_PUBLIC_ENABLE_DARK_MODE=true
```

### Backend (.env)
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/aurora_credit
JWT_SECRET=your_secure_jwt_secret_here
```

---

## Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL/TLS certificates installed
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Error logging setup
- [ ] Monitoring & alerts configured
- [ ] Backup strategy implemented
- [ ] Load balancer configured
- [ ] CDN setup for static assets

---

## Build & Deploy

### Frontend Build
```bash
cd frontend
npm run build
npm start
```

### Backend Build
```bash
cd backend
npm run build
npm start
```

---

## Monitoring

### Health Checks
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000/health`

### Logs
```bash
# Docker logs
docker-compose logs -f frontend
docker-compose logs -f backend
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database Connection Issues
- Verify MongoDB is running
- Check MONGODB_URI connection string
- Ensure network connectivity

### API Connection Issues
- Verify NEXT_PUBLIC_API_BASE_URL is correct
- Check CORS headers in backend
- Verify authentication tokens

---

## Security Recommendations

1. **Environment Variables**: Never commit secrets
2. **HTTPS**: Always use HTTPS in production
3. **Rate Limiting**: Implement on API endpoints
4. **Input Validation**: Validate all user inputs
5. **CORS**: Configure restrictive CORS policies
6. **Password**: Use strong JWT secrets and API keys
7. **Backups**: Regular database backups
8. **Updates**: Keep dependencies up-to-date

---

## Performance Optimization

### Frontend
- Next.js built-in optimization (code splitting, lazy loading)
- Caching strategies configured
- Image optimization enabled
- CSS minification active

### Backend
- MongoDB indexing configured
- Query optimization
- Caching layer (consider Redis)
- Connection pooling

---

## Support

For issues or questions:
1. Check logs: `docker-compose logs`
2. Review documentation in `/docs`
3. Contact development team

---

## Deployment Completed ✅

Your Aurora Credit OS platform is ready for production deployment!
