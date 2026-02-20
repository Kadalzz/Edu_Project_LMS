# ✅ Deployment Checklist

## Pre-Deployment

### Code Quality
- [x] All TypeScript errors fixed
- [x] ESLint warnings addressed
- [x] Code tested locally (all features)
- [x] Mobile responsive verified
- [x] Cross-browser testing done
- [x] All git changes committed
- [x] Repository pushed to GitHub

### Environment Setup
- [ ] Vercel account created
- [ ] Railway account created
- [x] Neon PostgreSQL database ready
- [x] Cloudflare R2 bucket configured
- [ ] All environment variables documented

### Documentation
- [x] README.md updated
- [x] API documentation complete
- [x] Deployment guide created
- [x] Environment variables template created
- [x] Testing scenarios documented

---

## Railway Backend Deployment

### Setup
- [ ] Railway account connected to GitHub
- [ ] New project created in Railway
- [ ] Backend service created
- [ ] Root directory set to `apps/backend`
- [ ] All environment variables added

### Configuration
- [ ] Build command: `pnpm install`
- [ ] Start command: `cd apps/backend && pnpm start:prod`
- [ ] Node version: 18.x
- [ ] Health check endpoint configured
- [ ] Auto-deploy from main branch enabled

### Deployment
- [ ] First deployment triggered
- [ ] Build completed successfully
- [ ] Service is running
- [ ] Public URL obtained
- [ ] Health endpoint accessible
- [ ] GraphQL playground accessible

### Testing
- [ ] Backend health check: `curl https://your-backend.railway.app/health`
- [ ] GraphQL endpoint responding
- [ ] Database connection working
- [ ] Can query users
- [ ] Can query classrooms
- [ ] File upload working (R2)

---

## Database Migration

### Prisma Setup
- [ ] DATABASE_URL environment variable set
- [ ] Prisma client generated
- [ ] Migrations deployed to production
- [ ] Seed script executed

### Data Verification
- [ ] 1 Teacher account created (guru1@lms.test)
- [ ] 4 Student accounts created (siswa1-4@lms.test)
- [ ] 1 Classroom created (Kelas 10A)
- [ ] Students enrolled in classroom
- [ ] Sample subject created (Matematika)
- [ ] Password: password123 works for all accounts

### Commands Used
```powershell
cd packages/database
$env:DATABASE_URL="your-neon-database-url"
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npx prisma studio  # Verify data
```

---

## Vercel Frontend Deployment

### Setup
- [ ] Vercel account connected to GitHub
- [ ] Project imported from GitHub
- [ ] Framework detected as Next.js
- [ ] Root directory set to `apps/frontend`

### Configuration
- [ ] Build command: `pnpm build`
- [ ] Output directory: `.next`
- [ ] Install command: `pnpm install`
- [ ] Node version: 18.x
- [ ] Environment variable added: `NEXT_PUBLIC_API_URL`

### Deployment
- [ ] First deployment triggered
- [ ] Build completed successfully
- [ ] Site is live
- [ ] Public URL obtained
- [ ] Custom domain configured (if any)

### Testing
- [ ] Frontend loads successfully
- [ ] No console errors
- [ ] API connection working
- [ ] Can reach login page
- [ ] Static assets loading
- [ ] Fonts rendering correctly

---

## End-to-End Testing (Production)

### Authentication
- [ ] Teacher login works (guru1@lms.test)
- [ ] Student login works (siswa1@lms.test)
- [ ] Invalid credentials rejected
- [ ] Logout works
- [ ] Session persists on refresh

### Teacher Flow
- [ ] Dashboard loads with correct stats
- [ ] Can view classrooms list
- [ ] Can open classroom detail
- [ ] Can view students
- [ ] Can create subject
- [ ] Can create module
- [ ] Can create lesson
- [ ] Can create assignment (QUIZ)
- [ ] Can create assignment (TASK)
- [ ] Can view submissions (if any)
- [ ] Can grade submissions

### Student Flow
- [ ] Dashboard shows XP and level
- [ ] Progress bar displays correctly
- [ ] Can view classrooms
- [ ] Can view subjects
- [ ] Can view lessons
- [ ] Can view assignments
- [ ] Can complete quiz
- [ ] Can submit task
- [ ] Can view grades
- [ ] XP updates after submission

### Parent Flow
- [ ] Can switch to parent view
- [ ] Child progress displays correctly
- [ ] Can view child stats
- [ ] Can add note for teacher
- [ ] Can switch back to student view

### Mobile Responsive
- [ ] Login page responsive (375px width)
- [ ] Dashboard responsive
- [ ] Navigation menu works (hamburger)
- [ ] Cards stack properly
- [ ] Forms usable on mobile
- [ ] Typography readable
- [ ] Buttons tappable (44px min)

### Performance
- [ ] Dashboard loads < 3 seconds
- [ ] API responses < 2 seconds
- [ ] Images load efficiently
- [ ] No layout shift
- [ ] Smooth scrolling

---

## Post-Deployment

### Monitoring Setup
- [ ] Railway logs accessible
- [ ] Vercel logs accessible
- [ ] Error tracking considered (Sentry)
- [ ] Uptime monitoring considered
- [ ] Database backup verified

### Documentation
- [ ] Production URLs documented
- [ ] Test credentials documented
- [ ] Troubleshooting guide reviewed
- [ ] Team notified of deployment

### Handoff
- [ ] Stakeholders notified
- [ ] Demo scheduled (if needed)
- [ ] Feedback mechanism established
- [ ] Support plan defined

---

## Issues Found

### Critical (Must Fix Before Launch)
_None_

### High Priority (Fix Soon)
_None_

### Medium Priority (Fix in Next Sprint)
_None_

### Low Priority (Nice to Have)
_None_

---

## Sign-Off

**Deployed By**: _______________  
**Date**: _______________  
**Backend URL**: _______________  
**Frontend URL**: _______________  

**Status**: 
- [ ] Ready for Production ✅
- [ ] Needs Minor Fixes ⚠️
- [ ] Blocked ❌

**Next Steps**:
1. _____________________________
2. _____________________________
3. _____________________________

---

## Rollback Plan

If critical issues are found after deployment:

### Vercel Rollback
```bash
1. Go to Vercel Dashboard
2. Navigate to Deployments
3. Find previous working deployment
4. Click "..." → "Promote to Production"
```

### Railway Rollback
```bash
1. Go to Railway Dashboard
2. Navigate to Deployments
3. Find previous working deployment
4. Click "Redeploy"
```

### Database Rollback
```powershell
# If migrations need to be rolled back:
cd packages/database
$env:DATABASE_URL="your-database-url"
npx prisma migrate resolve --rolled-back <migration-name>
```

---

## Notes

_Add any deployment notes, gotchas, or special considerations here_
