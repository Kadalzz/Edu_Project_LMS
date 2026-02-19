# LMS untuk Anak Berkebutuhan Khusus

Learning Management System yang dirancang khusus untuk anak dengan hambatan intelektual.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + TailwindCSS + shadcn/ui
- **Backend**: NestJS + Prisma ORM + GraphQL
- **Database**: Neon.tech (PostgreSQL)
- **Cache**: Upstash (Redis)
- **Storage**: Cloudflare R2
- **Auth**: Supabase Auth
- **Email**: Resend
- **Monorepo**: Turborepo + pnpm workspaces

## Project Structure

```
apps/
  frontend/       # Next.js application
  backend/        # NestJS API
packages/
  database/       # Prisma schema & client
  types/          # Shared TypeScript types
  ui/             # Shared UI components
```

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8

### Installation

```bash
# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env
# Edit .env with your actual credentials

# Generate Prisma Client
pnpm db:generate

# Push database schema
pnpm db:push

# Start development servers
pnpm dev
```

### Development

```bash
# Run all apps in dev mode
pnpm dev

# Run specific app
pnpm --filter @lms/frontend dev
pnpm --filter @lms/backend dev

# Database commands
pnpm db:studio       # Open Prisma Studio
pnpm db:migrate      # Run migrations
pnpm db:generate     # Generate Prisma Client
pnpm db:push         # Push schema to database
```

## Features (Fase 1 - MVP)

- ✅ Authentication & Role Management (Teacher, Student-Parent)
- ✅ Content Management (Video, PDF, Images)
- ✅ Quiz System (Multiple Choice with Auto-grading)
- ✅ Task Analysis (Step-by-step with Photo + Video submission)
- ✅ Progress Tracking with Level/XP System
- ✅ Teacher Notes & Daily Reports
- ✅ Dashboard Enhancements (Parent view, Pending grading, Recent grades)
- ✅ Media Upload & Management (Cloudflare R2, Image/Video library)
- ✅ Email Notifications
- ✅ Responsive Design with Basic Accessibility

## Target Users (Pilot)

- 1 Guru
- 4 Siswa (Student-Parent combined accounts)
- 1 Classroom

## License

Private - Educational Use Only
