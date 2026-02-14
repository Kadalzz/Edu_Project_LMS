# 🚀 SETUP GUIDE - LMS ABK

Panduan lengkap untuk setup dan menjalankan project.

## Prerequisites

Pastikan sudah terinstall:
- **Node.js** >= 18 ([Download](https://nodejs.org/))
- **pnpm** >= 8 (Install: `npm install -g pnpm`)
- **Git** ([Download](https://git-scm.com/))

## 📋 Step 1: Clone & Install Dependencies

```bash
cd c:\git\EDU_PROJECT_LMS

# Install all dependencies
pnpm install
```

Ini akan install dependencies untuk:
- Root workspace
- Frontend (Next.js)
- Backend (NestJS)
- Packages (database, types)

## 🔐 Step 2: Setup Environment Variables

### 2.1 Create `.env` file

```bash
# Copy dari template
cp .env.example .env
```

### 2.2 Sign Up untuk Services (FREE!)

#### **A. Neon.tech (PostgreSQL Database)**

1. Ke [neon.tech](https://neon.tech)
2. Sign up (free, no credit card required)
3. Create new project → "LMS-ABK"  
4. Copy **Connection String**
5. Paste ke `.env`:
   ```
   DATABASE_URL="postgresql://username:password@host/dbname?sslmode=require"
   ```

#### **B. Supabase (Authentication)**

1. Ke [supabase.com](https://supabase.com)
2. Sign up → Create new project
3. Tunggu project ready (~2 menit)
4. Ke **Settings** → **API**
5. Copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key
6. Paste ke `.env`:
   ```
   NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJh..."
   SUPABASE_SERVICE_ROLE_KEY="eyJh..."
   ```

#### **C. Cloudflare R2 (File Storage)**

1. Ke [cloudflare.com](https://www.cloudflare.com)
2. Sign up → Dashboard
3. **R2 Object Storage** (sidebar)
4. Create bucket → "lms-abk-storage"
5. **Manage R2 API Tokens** → Create API Token
6. Copy:
   - Account ID
   - Access Key ID  
   - Secret Access Key
7. Paste ke `.env`:
   ```
   R2_ACCOUNT_ID="xxxxx"
   R2_ACCESS_KEY_ID="xxxxx"
   R2_SECRET_ACCESS_KEY="xxxxx"
   R2_BUCKET_NAME="lms-abk-storage"
   ```
8. **Public URL**: Ke bucket settings → Public URL → Enable → Copy URL
   ```
   R2_PUBLIC_URL="https://pub-xxxxx.r2.dev"
   ```

#### **D. Upstash (Redis Cache)**

1. Ke [upstash.com](https://upstash.com)
2. Sign up → Create database
3. Type: **Redis**
4. Name: "lms-abk-cache"
5. Region: pilih terdekat
6. Copy **Redis URL** (starts with `redis://`)
7. Paste ke `.env`:
   ```
   REDIS_URL="redis://default:xxxxx@xxxxx.upstash.io:xxxxx"
   ```

#### **E. Resend (Email Service)**

1. Ke [resend.com](https://resend.com)
2. Sign up (free tier: 100 emails/day)
3. **API Keys** → Create API Key
4. Copy API key
5. Paste ke `.env`:
   ```
   RESEND_API_KEY="re_xxxxx"
   EMAIL_FROM="noreply@yourdomain.com"
   ```

**Note:** Untuk development, bisa pakai email dummy atau email Anda sendiri.

### 2.3 Generate JWT Secrets

```bash
# Generate random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy output dan paste ke `.env`:
```
JWT_SECRET="hasil-generate-1"
JWT_REFRESH_SECRET="hasil-generate-2"
```

### 2.4 Lengkapi sisanya

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
API_URL="http://localhost:3001"
NODE_ENV="development"
```

## 🗄️ Step 3: Setup Database

### 3.1 Generate Prisma Client

```bash
pnpm db:generate
```

### 3.2 Push Schema to Database

```bash
pnpm db:push
```

Output:
```
✔ Generated Prisma Client
✔ Database synchronized
```

### 3.3 Seed Initial Data

```bash
pnpm db:seed
```

Ini akan create:
- ✅ 1 Teacher account
- ✅ 4 Student-Parent accounts
- ✅ 1 Classroom
- ✅ 2 Subjects (Matematika, Life Skills)
- ✅ 1 Module (Kegiatan Makan)

Output akan tampilkan **login credentials** untuk semua akun.

**Simpan credentials ini!**

## 🎉 Step 4: Run Development Servers

### Option A: Run All (Recommended)

```bash
pnpm dev
```

Ini akan start:
- ✅ Frontend: http://localhost:3000
- ✅ Backend: http://localhost:3001
- ✅ GraphQL Playground: http://localhost:3001/graphql

### Option B: Run Individual

Terminal 1 - Frontend:
```bash
pnpm --filter @lms/frontend dev
```

Terminal 2 - Backend:
```bash
pnpm --filter @lms/backend dev
```

## ✅ Verify Setup

### 1. Check Frontend
- Buka http://localhost:3000
- Should see "Day 1: Setup Complete! ✅"

### 2. Check Backend
- Buka http://localhost:3001/graphql
- GraphQL Playground should load

### 3. Check Database
```bash
pnpm db:studio
```
- Prisma Studio akan buka di browser
- Bisa lihat semua tables & data

## 🐛 Troubleshooting

### Error: "Cannot find module '@lms/database'"

```bash
pnpm db:generate
```

### Error: "Database connection failed"

Check `.env`:
- DATABASE_URL correct?
- Try test connection:
  ```bash
  pnpm --filter @lms/database prisma db push
  ```

### Error: "Port 3000 already in use"

```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or change port
PORT=3002 pnpm dev
```

### Prisma Client out of sync

```bash
pnpm db:generate
```

### Fresh start (reset everything)

```bash
# Delete node_modules
pnpm clean

# Reinstall
pnpm install

# Regenerate Prisma
pnpm db:generate

# Push schema
pnpm db:push

# Seed again
pnpm db:seed
```

## 📚 Useful Commands

```bash
# Development
pnpm dev                    # Run all apps
pnpm build                  # Build all apps
pnpm lint                   # Lint all apps
pnpm type-check             # TypeScript check

# Database
pnpm db:generate            # Generate Prisma Client
pnpm db:push                # Push schema to database
pnpm db:migrate             # Create migration
pnpm db:studio              # Open Prisma Studio
pnpm db:seed                # Seed database

# Individual apps
pnpm --filter @lms/frontend dev
pnpm --filter @lms/backend dev
```

## 🎯 Next Steps (Day 2)

Setelah setup berhasil, lanjut ke Day 2:
- Authentication flow (login, register)
- Protected routes
- User management
- Role switching (student ↔ parent)

## 📞 Need Help?

Jika ada error atau stuck, check:
1. Semua services (Neon, Supabase, etc.) sudah setup?
2. `.env` file sudah benar?
3. Dependencies sudah install (`pnpm install`)?
4. Prisma Client sudah generate (`pnpm db:generate`)?

---

**Day 1 Complete! 🎉**

Structure: ✅ | Database: ✅ | Environment: ✅ | Ready for Day 2: ✅
