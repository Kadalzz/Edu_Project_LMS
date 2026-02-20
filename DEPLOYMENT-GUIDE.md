# 🚀 Deployment Guide - Learning Management System

## Overview
Panduan lengkap untuk deploy aplikasi LMS ke production:
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Neon PostgreSQL (sudah ada)
- **Storage**: Cloudflare R2 (sudah ada)

---

## 📋 Pre-Deployment Checklist

### ✅ Code Ready
- [x] All features tested locally
- [x] UI responsive (mobile + desktop)
- [x] No TypeScript errors
- [x] All critical bugs fixed
- [x] Git repository up to date

### ✅ Third-Party Services
- [x] Neon PostgreSQL database ready
- [x] Cloudflare R2 bucket configured
- [ ] Vercel account created
- [ ] Railway account created

---

## 🔐 Environment Variables

### Backend (Railway)

```env
# Database
DATABASE_URL=postgresql://neondb_owner:npg_0iTkjcsdhuV4@ep-soft-block-a1hhgzhl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# JWT Secrets
JWT_SECRET=jwt-secret-dev-lms-abk-2024
JWT_REFRESH_SECRET=refresh-secret-dev-lms-abk-2024

# Cloudflare R2
R2_ACCOUNT_ID=7b5877f76482243000a276c4e4892d2
R2_ACCESS_KEY_ID=707832ab9d7cd0571bb22d27cdce8106
R2_SECRET_ACCESS_KEY=a1591e39158ee052c65e056605717577f5c72D41cd611d2e043e2ab56de9c1f8
R2_BUCKET_NAME=lms-abk-storage
R2_PUBLIC_URL=https://7b5877f76482243000a276c4e4892d2.r2.cloudflarestorage.com

# Node Environment
NODE_ENV=production

# Port (Railway will set this automatically)
PORT=3001
```

### Frontend (Vercel)

```env
# Backend API URL (will be set after Railway deployment)
NEXT_PUBLIC_API_URL=https://your-backend-app.railway.app/graphql

# Optional: Analytics, Monitoring
# NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

---

## 🎯 Deployment Steps

### Step 1: Deploy Backend to Railway

#### 1.1 Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub account
3. Link your GitHub repository

#### 1.2 Create New Project
```bash
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose: Kadalzz/Edu_Project_LMS
4. Railway will auto-detect the monorepo
```

#### 1.3 Configure Backend Service
```bash
# In Railway dashboard:
1. Click "New Service" → "Empty Service"
2. Name it: "lms-backend"
3. Go to Settings → Root Directory
   Set to: apps/backend
```

#### 1.4 Set Environment Variables
```bash
# In Railway → Backend Service → Variables
Add all backend environment variables from section above
```

#### 1.5 Configure Build & Start Commands
```bash
# In Railway → Backend Service → Settings → Build Command
pnpm install

# Start Command
cd apps/backend && pnpm start:prod
```

#### 1.6 Deploy
```bash
# Railway will automatically deploy
# Wait for deployment to complete
# Get the public URL: https://your-backend-app.railway.app
```

#### 1.7 Verify Backend
```bash
# Check health endpoint
curl https://your-backend-app.railway.app/health

# Check GraphQL playground
Open: https://your-backend-app.railway.app/graphql
```

---

### Step 2: Migrate Database & Seed Data

#### 2.1 Run Prisma Migrations
```powershell
# Connect to production database
cd c:\git\EDU_PROJECT_LMS\packages\database

$env:DATABASE_URL="postgresql://neondb_owner:npg_0iTkjcsdhuV4@ep-soft-block-a1hhgzhl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (teacher + 4 students + 1 class)
npx prisma db seed
```

#### 2.2 Verify Data
```powershell
# Open Prisma Studio to check data
npx prisma studio
```

Expected data:
- ✅ 1 Teacher account (guru1@lms.test)
- ✅ 4 Student accounts (siswa1-4@lms.test)
- ✅ 1 Classroom (Kelas 10A)
- ✅ Students enrolled in classroom
- ✅ Sample subject (Matematika)

---

### Step 3: Deploy Frontend to Vercel

#### 3.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub account
3. Import your repository

#### 3.2 Import Project
```bash
1. Click "Add New..." → "Project"
2. Import Git Repository: Kadalzz/Edu_Project_LMS
3. Vercel auto-detects Next.js
```

#### 3.3 Configure Project Settings
```yaml
Framework Preset: Next.js
Root Directory: apps/frontend
Build Command: pnpm build
Output Directory: .next
Install Command: pnpm install

Node.js Version: 18.x
```

#### 3.4 Set Environment Variables
```bash
# In Vercel → Project Settings → Environment Variables
NEXT_PUBLIC_API_URL=https://your-backend-app.railway.app/graphql

# Add for all environments: Production, Preview, Development
```

#### 3.5 Deploy
```bash
# Click "Deploy"
# Vercel will build and deploy
# Get URL: https://your-app.vercel.app
```

#### 3.6 Configure Custom Domain (Optional)
```bash
# In Vercel → Project Settings → Domains
# Add your custom domain
# Follow DNS configuration instructions
```

---

## 🧪 Post-Deployment Testing

### Test Backend Health
```bash
# Check if backend is running
curl https://your-backend-app.railway.app/health

# Response should be: {"status":"ok"}
```

### Test GraphQL API
```bash
# Open GraphQL playground
https://your-backend-app.railway.app/graphql

# Try a simple query:
query {
  users {
    id
    email
    role
  }
}
```

### Test Frontend
```bash
# 1. Open your Vercel URL
https://your-app.vercel.app

# 2. Login as teacher
Email: guru1@lms.test
Password: password123

# 3. Check dashboard loads
# 4. Verify API connection works
# 5. Test key features:
   - View classrooms
   - View students
   - Create assignment
   - View reports
```

### Test Student Flow
```bash
# Login as student
Email: siswa1@lms.test
Password: password123

# Verify:
- Dashboard shows XP
- Can view lessons
- Can see assignments
- Can switch to parent view
```

---

## 🔥 Smoke Tests Checklist

Run these critical tests on production:

### Authentication
- [ ] Teacher can login
- [ ] Student can login
- [ ] Logout works
- [ ] Invalid credentials rejected

### Teacher Features
- [ ] View dashboard with stats
- [ ] View classrooms list
- [ ] View students in classroom
- [ ] Create assignment
- [ ] View student submissions

### Student Features
- [ ] View dashboard with XP
- [ ] View lessons
- [ ] View assignments
- [ ] Submit assignment
- [ ] Check grades

### Parent Features
- [ ] Switch to parent view
- [ ] View child progress
- [ ] Add note for teacher

### Mobile Responsive
- [ ] Login page responsive
- [ ] Dashboard responsive on mobile
- [ ] Navigation menu works
- [ ] Forms usable on mobile

---

## 📊 Monitoring & Maintenance

### Railway Monitoring
```bash
# In Railway Dashboard:
- Check service logs
- Monitor CPU/Memory usage
- Set up alerts for downtime
```

### Vercel Monitoring
```bash
# In Vercel Dashboard:
- Check deployment logs
- Monitor function execution
- Check analytics (if enabled)
- Set up Vercel Speed Insights
```

### Database Monitoring
```bash
# In Neon Dashboard:
- Check active connections
- Monitor query performance
- Check storage usage
- Set up backup schedule (if not auto)
```

---

## 🐛 Troubleshooting

### Backend Not Starting on Railway
```bash
# Check logs in Railway dashboard
# Common issues:
1. Missing environment variables
2. Database connection timeout
3. Build command failed
4. Port configuration issue

# Solution:
- Verify all env vars are set
- Check DATABASE_URL is correct
- Ensure start command is: cd apps/backend && pnpm start:prod
```

### Frontend Can't Connect to Backend
```bash
# Check:
1. NEXT_PUBLIC_API_URL is correct
2. Backend URL is public and accessible
3. CORS is enabled in backend (should be by default)

# Test backend directly:
curl https://your-backend-app.railway.app/graphql
```

### Database Migration Failed
```bash
# Check:
1. DATABASE_URL is correct
2. Database is accessible from your machine
3. Migrations are in sync

# Reset and retry:
$env:DATABASE_URL="your-database-url"
npx prisma migrate reset --force
npx prisma migrate deploy
npx prisma db seed
```

### Build Fails on Vercel
```bash
# Common issues:
1. TypeScript errors
2. Missing dependencies
3. Build command incorrect

# Solution:
# Run build locally first:
cd apps/frontend
pnpm build

# Fix any errors before redeploying
```

---

## 🔄 Update/Redeploy Process

### Update Code
```bash
# 1. Make changes locally
# 2. Test thoroughly
# 3. Commit and push

git add .
git commit -m "feat: new feature"
git push origin main
```

### Auto-Deploy
```bash
# Vercel: Auto-deploys on push to main branch
# Railway: Auto-deploys on push to main branch

# No manual action needed!
```

### Manual Deploy
```bash
# Vercel: Go to Deployments → Redeploy
# Railway: Go to Deployments → Deploy Latest
```

---

## 📝 Production URLs

After deployment, update these:

```
Frontend: https://your-app.vercel.app
Backend:  https://your-backend-app.railway.app
GraphQL:  https://your-backend-app.railway.app/graphql
```

### Test Credentials (Production)
```
TEACHER:
Email: guru1@lms.test
Password: password123

STUDENT 1:
Email: siswa1@lms.test
Password: password123

STUDENT 2:
Email: siswa2@lms.test
Password: password123

STUDENT 3:
Email: siswa3@lms.test
Password: password123

STUDENT 4:
Email: siswa4@lms.test
Password: password123
```

---

## ✅ Final Checklist

- [ ] Backend deployed to Railway successfully
- [ ] Frontend deployed to Vercel successfully
- [ ] Database migrated and seeded
- [ ] Environment variables configured correctly
- [ ] All smoke tests passed
- [ ] Mobile responsiveness verified
- [ ] Production URLs documented
- [ ] Monitoring set up
- [ ] Team notified of deployment
- [ ] Documentation updated

---

## 🎉 Post-Deployment

Congratulations! Your LMS is now live! 🚀

### Next Steps
1. Share URLs with stakeholders
2. Monitor logs for first 24 hours
3. Gather user feedback
4. Plan next iteration features
5. Set up regular backups
6. Consider adding:
   - Error monitoring (Sentry)
   - Analytics (Google Analytics)
   - Performance monitoring
   - CDN for assets

---

## 📞 Support

If you encounter issues:
1. Check troubleshooting section above
2. Review logs in Railway/Vercel dashboards
3. Check GitHub Issues
4. Contact development team

---

**Last Updated**: February 20, 2026  
**Version**: 1.0.0  
**Status**: Ready for Production 🟢
