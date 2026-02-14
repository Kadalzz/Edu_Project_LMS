# 📋 Setup Checklist - External Services per Day

## 📌 Legend
- 🔴 **MANDATORY** - Harus setup untuk development/testing
- 🟡 **RECOMMENDED** - Sebaiknya setup untuk testing optimal
- 🟢 **OPTIONAL** - Bisa skip untuk MVP, hanya untuk production/polish

---

## ✅ Day 1: Project Setup (DONE)
**External Services**: ❌ None  
**Status**: Complete

**Checklist**:
- [x] Monorepo structure (Turborepo)
- [x] Database schema (Prisma)
- [x] Frontend/Backend boilerplate

---

## ✅ Day 2: Authentication & User Management (DONE)
**External Services**: 🔴 **Database Required**

### 🔴 MANDATORY: Neon.tech PostgreSQL
**Kenapa perlu**: Backend sudah ada, tapi tidak bisa test login tanpa database  
**Free Tier**: 0.5GB storage, 1 project  
**Setup Time**: ~10 menit  

**Action Steps**:
```bash
1. Buat akun: https://neon.tech (gratis, no credit card)
2. Create Project → "LMS-ABK-Production"
3. Copy Connection String
4. Update .env:
   DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
5. Run: cd c:\git\EDU_PROJECT_LMS
        pnpm db:push
6. Run: pnpm db:seed
7. Test login: guru@lms-abk.com / Guru123!
```

**Testing**:
- [ ] Login as Teacher (guru@lms-abk.com)
- [ ] Login as Student (siswa1@lms-abk.com)
- [ ] Test role switching (Student ↔ Parent)
- [ ] Test token refresh
- [ ] Test logout

---

## 📅 Day 3: Classroom & Subject Management
**External Services**: ❌ None (uses existing database)

**What's Built**:
- Teacher creates classrooms
- Add/edit subjects per classroom
- View classroom list

**Requirements**:
- ✅ Database (sudah setup di Day 2)
- ❌ No new external service

**Testing**:
- [ ] Teacher create classroom "Kelas 1B"
- [ ] Add subjects: Matematika, Bahasa Indonesia
- [ ] View classroom dashboard
- [ ] Edit classroom name

---

## 📅 Day 4: Module & Lesson Creation
**External Services**: ❌ None

**What's Built**:
- Teacher creates learning modules
- Create lessons with text/image content
- Organize lessons in modules

**Requirements**:
- ✅ Database (sudah setup)
- ❌ No new external service
- ⚠️ Image upload nanti di Day 9 (pakai URL placeholder dulu)

**Testing**:
- [ ] Create module "Belajar Angka"
- [ ] Add lesson with text content
- [ ] Student view lessons
- [ ] Complete lesson

---

## 📅 Day 5: Quiz & Task Assignment System
**External Services**: ❌ None

**What's Built**:
- Teacher creates Quiz (multiple choice)
- Teacher creates Task Analysis (step-by-step)
- Assign to classrooms
- Set deadlines

**Requirements**:
- ✅ Database only
- ❌ No new external service

**Testing**:
- [ ] Create quiz with 5 questions
- [ ] Create task analysis with 3 steps
- [ ] Student view assignments
- [ ] Check deadline display

---

## 📅 Day 6: Submission & Grading
**External Services**: 🟡 **Storage Recommended** (bisa pakai placeholder)

**What's Built**:
- Student submit quiz answers
- Student submit task photos/videos
- Teacher review submissions
- Teacher approve/reject/grade

### 🟡 RECOMMENDED: Cloudflare R2
**Kenapa perlu**: Task Analysis butuh upload foto/video step-by-step  
**Free Tier**: 10GB storage/month, 1 million Class B operations/month  
**Setup Time**: ~15 menit  
**Alternative**: Skip dulu, pakai base64 atau URL placeholder

**Action Steps** (jika mau setup):
```bash
1. Buat akun: https://dash.cloudflare.com
2. Dashboard → R2 Object Storage → Create Bucket
3. Bucket name: "lms-abk-storage"
4. Create API Token → Copy credentials
5. Update .env:
   R2_ACCOUNT_ID="abc123"
   R2_ACCESS_KEY_ID="key123"
   R2_SECRET_ACCESS_KEY="secret123"
   R2_BUCKET_NAME="lms-abk-storage"
   R2_PUBLIC_URL="https://pub-xxx.r2.dev"
6. Test upload via API
```

**Option B - Skip R2**:
```bash
# Use placeholder URLs or base64 for now
# Setup R2 nanti di Day 9 sekaligus
```

**Testing**:
- [ ] Student submit quiz
- [ ] Student upload task photo (with/without R2)
- [ ] Teacher view submissions
- [ ] Teacher approve task
- [ ] Check submission status

---

## 📅 Day 7: XP & Leveling System
**External Services**: ❌ None

**What's Built**:
- Award XP on approved submissions
- Level up system (100 XP per level)
- XP history tracking
- Level badges (Pemula → Ahli)

**Requirements**:
- ✅ Database only
- ❌ No new external service

**Testing** (CRITICAL):
- [ ] Start at Level 1, 0 XP
- [ ] Complete quiz → +10 XP
- [ ] Complete task → +20 XP  
- [ ] Reach 100 XP → Level 2
- [ ] Check XP history
- [ ] Test level badge display

---

## 📅 Day 8: Notes & Daily Reports
**External Services**: 🟢 **Email Optional**

**What's Built**:
- Teacher write notes (threaded)
- Teacher create daily reports (mood tracking)
- Parent view reports
- Email notifications (optional)

### 🟢 OPTIONAL: Resend (Email Service)
**Kenapa optional**: Development bisa pakai console.log, email hanya untuk UX polish  
**Free Tier**: 3,000 emails/month  
**Setup Time**: ~10 menit  

**Action Steps** (jika mau setup):
```bash
1. Buat akun: https://resend.com (gratis)
2. Get API key
3. Verify domain (atau pakai onboarding.resend.dev untuk testing)
4. Update .env:
   RESEND_API_KEY="re_abc123"
   EMAIL_FROM="noreply@lms-abk.com"
5. Test send email
```

**Option B - Skip Email**:
```bash
# Console.log notifications instead
# Setup email nanti saat production
```

**Testing**:
- [ ] Teacher write note on student
- [ ] Reply to note (threaded)
- [ ] Create daily report with mood
- [ ] Parent view daily reports
- [ ] Check email notification (if enabled)

---

## 📅 Day 9: Media Upload & Management
**External Services**: 🔴 **Storage Required** (jika belum setup di Day 6)

### 🔴 MANDATORY: Cloudflare R2 (jika belum setup)
**Jika sudah setup di Day 6**: ✅ Skip  
**Jika belum setup**: Follow Day 6 instructions

**What's Built**:
- Media upload component (photo/video)
- File validation (size, type)
- Preview thumbnails
- Media library for teacher

**Testing**:
- [ ] Upload lesson image
- [ ] Upload task step video
- [ ] Upload student avatar
- [ ] Check file size limits (5MB photo, 20MB video)
- [ ] Delete media

---

## 📅 Day 10: Testing, Polish & Deployment
**External Services**: 🔴 **Deployment Platforms Required**

### 🔴 MANDATORY: Vercel (Frontend)
**Free Tier**: Unlimited bandwidth, 100GB/month  
**Setup Time**: ~10 menit  

**Action Steps**:
```bash
1. Buat akun: https://vercel.com (login with GitHub)
2. Import Git repository
3. Framework: Next.js (auto-detected)
4. Root directory: apps/frontend
5. Add Environment Variables:
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/graphql
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
6. Deploy
```

### 🔴 MANDATORY: Railway.app (Backend)
**Free Tier**: $5 credit/month (cukup untuk MVP)  
**Alternative**: Render.com (gratis tapi cold start)  
**Setup Time**: ~15 menit  

**Action Steps**:
```bash
1. Buat akun: https://railway.app (login with GitHub)
2. New Project → Deploy from GitHub
3. Select repository
4. Root directory: apps/backend
5. Add Environment Variables:
   DATABASE_URL=<dari Neon>
   JWT_SECRET=<random string>
   JWT_REFRESH_SECRET=<random string>
   R2_ACCOUNT_ID=<dari Cloudflare>
   R2_ACCESS_KEY_ID=<dari Cloudflare>
   R2_SECRET_ACCESS_KEY=<dari Cloudflare>
   R2_BUCKET_NAME=lms-abk-storage
   R2_PUBLIC_URL=<dari Cloudflare>
   NODE_ENV=production
6. Deploy
7. Copy public URL
8. Update Vercel env: NEXT_PUBLIC_API_URL
```

**Alternative: Render.com** (100% Free):
```bash
1. Buat akun: https://render.com
2. New Web Service → Connect GitHub
3. Build: npm install && npm run build
4. Start: npm run start:prod
5. Instance Type: Free (cold start setelah 15 menit idle)
```

**Testing E2E**:
- [ ] Deploy backend → Railway
- [ ] Deploy frontend → Vercel
- [ ] Test production login
- [ ] Test all flows in production
- [ ] Check performance
- [ ] Mobile responsive testing
- [ ] Browser compatibility (Chrome, Safari, Firefox)

---

## 📊 Summary: When to Setup What

### **SETUP SEKARANG** (After Day 2):
```
✅ Neon.tech Database    → 🔴 MANDATORY untuk test login
```

### **SETUP Day 6-9**:
```
⚠️ Cloudflare R2         → 🟡 Recommended (bisa pakai placeholder dulu)
⚠️ Resend Email          → 🟢 Optional (skip aja untuk MVP)
```

### **SETUP Day 10**:
```
✅ Vercel (Frontend)     → 🔴 MANDATORY untuk deployment
✅ Railway (Backend)     → 🔴 MANDATORY untuk deployment
```

---

## 💰 Total Cost (Free Tier)

| Service | Free Tier | Limitation | Cost if Exceeded |
|---------|-----------|------------|------------------|
| **Neon.tech** | 0.5GB | 1 project | $19/mo for more storage |
| **Cloudflare R2** | 10GB | 1M operations/mo | $0.015/GB after |
| **Resend** | 3K emails/mo | 100 emails/day | $20/mo for 50K |
| **Vercel** | 100GB bandwidth | 1 team | $20/mo for more |
| **Railway** | $5 credit/mo | ~500 hours | $0.01/hour after |

**Total untuk MVP**: **$0/month** ✅ (semua dalam free tier)

---

## 🎯 Recommended Setup Timeline

### **Timeline A - Test Per Feature** (Recommended):
```
NOW:     Setup Neon Database (10 min)
         → Test Day 2 auth flow
         
Day 6:   Setup Cloudflare R2 (15 min)
         → Test file upload
         
Day 8:   (Optional) Setup Resend Email (10 min)
         → Test notifications
         
Day 10:  Setup Vercel + Railway (30 min)
         → Full deployment & testing
```

### **Timeline B - Batch Setup** (Faster):
```
NOW:     Setup Neon Database only
         → Dev on localhost Day 3-9
         
Day 10:  Setup ALL at once (R2 + Email + Deploy)
         → 60-90 menit total
```

---

## ✅ Next Action

**Pilihan**:

1. **Setup Neon Database NOW** → Test login Day 2 works ✅
   - [Ikuti panduan di atas untuk Neon setup]
   - Duration: 10-15 menit
   - Test: Login as teacher & student

2. **Skip Setup, Lanjut Day 3** → Tidak bisa test auth sampai database ready ⚠️
   - Risky: Kalau ada bug di auth, baru ketahuan nanti
   
3. **Setup Semua Sekaligus** → Overkill, belum butuh R2/Email/Deploy ❌

**Rekomendasi**: **Pilihan 1** - Setup Neon Database sekarang, 10 menit aja!

Mau saya guide step-by-step setup Neon database sekarang?
