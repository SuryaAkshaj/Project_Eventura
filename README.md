# Eventura — Enterprise Event Management Platform

<div align="center">

![Eventura](https://img.shields.io/badge/Eventura-Enterprise%20Event%20Management-2E3192?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js%2014-black?style=for-the-badge&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

**A full-stack, multi-tenant SaaS platform for college and enterprise event management.**

[Features](#features) · [Architecture](#architecture) · [Getting Started](#getting-started) · [API](#api) · [Roles](#roles) · [Tech Stack](#tech-stack)

</div>

---

## What is Eventura?

Eventura replaces the fragmented way colleges manage events — Google Forms for registration, WhatsApp for updates, UPI screenshots for payments, and paper for attendance — with a single, secure, enterprise-grade platform.

**The problem it solves:**
- Registrations scattered across Google Forms
- No access control or role separation
- Payments via informal UPI with no receipts
- Paper attendance sheets with no duplicate prevention
- No certificates or proof of attendance

**What Eventura provides:**
- Role-based event management with 5-tier hierarchy
- QR code tickets with fraud-proof check-in
- Direct Razorpay payments to organiser bank accounts
- Auto-generated PDF certificates with blockchain hash
- Multi-college federation with visibility controls

---

## Features

### For Attendees
- Browse and search events across colleges
- Register for free or paid events
- QR code tickets in a digital wallet
- Auto-refresh rotating QR nonces (anti-screenshot)
- Download verified PDF attendance certificates
- Waitlist when events are full

### For Club Presidents / College Admins
- Multi-step event creation wizard
- Event visibility controls (My College / Selected Colleges / All Platform / Public)
- Pre-flight readiness checklist before publishing
- Live check-in dashboard with real-time stats
- Mobile QR scanner (browser-based, no app needed)
- Appoint Event Managers per event
- Payout dashboard with transaction history

### For Super Admins
- Approve/reject college and club registrations
- Platform-wide stats (users, events, revenue)
- Multi-tenant health metrics per college
- Platform fee toggle (2-3% cut on all transactions)
- Full audit log of all platform actions
- Maintenance mode toggle

### Platform
- 5-tier RBAC (Super Admin → College Admin / Club President → Event Manager → Attendee)
- Users can hold multiple roles simultaneously
- Automatic multi-tenant data isolation via Prisma query middleware
- Rotating QR nonces with Redis TTL (prevent replay attacks)
- Razorpay Route split payments (direct to organiser)
- Idempotency keys on all financial operations
- Brute-force protection on login (5 attempts → 15 min lockout)
- JWT access tokens (15m) + refresh tokens (7d) with Redis blacklisting

---

Frontend: Next.js 14, App Router, TypeScript, Tailwind CSS v3, port 3000
- Backend: Node.js + Express + TypeScript, port 4000
- All API routes prefixed with `/api/v1/`
- Test Attendee: `test@woxsen.edu.in` / `Test@1234`
- Super Admin: `admin@eventura.app` / `Admin@1234`
- Club President: `collegeadmin@woxsen.edu.in` / `Test@1234`
- College Ad`colmin: legeadmin@woxsen.edu.in` / `Test@1234`
- Frontend API base: `http://localhost:4000/api/v1`

## Architecture

```
eventura-monorepo/
├── eventura/                    # Next.js 14 Frontend
│   ├── app/
│   │   ├── (public)/           # Landing, Login, Signup
│   │   ├── (attendee)/         # Dashboard, Events, Tickets, Certificates
│   │   ├── (organiser)/        # Org Dashboard, Event Management
│   │   └── (admin)/            # Super Admin Panel
│   ├── components/
│   │   └── layout/             # Role-specific navigation
│   ├── lib/
│   │   ├── api/                # Typed API clients
│   │   ├── store/              # Zustand auth store
│   │   ├── hooks/              # useRazorpay, custom hooks
│   │   └── providers/          # React Query provider
│   └── middleware.ts           # JWT-based route protection
│
├── eventura-api/                # Node.js + Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts     # Dual Prisma clients (admin + tenant-aware)
│   │   │   ├── redis.ts        # Redis client with helpers
│   │   │   └── env.ts          # Zod environment validation
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts       # JWT verification + blacklist check
│   │   │   ├── rbac.middleware.ts       # Role + permission enforcement
│   │   │   ├── tenant.middleware.ts     # AsyncLocalStorage tenant context
│   │   │   ├── rateLimiter.middleware.ts # Redis-backed sliding window
│   │   │   └── errorHandler.middleware.ts # Global error handler
│   │   ├── modules/
│   │   │   ├── auth/           # Signup, login, OTP, JWT, brute-force
│   │   │   ├── events/         # CRUD, visibility, readiness score
│   │   │   ├── registrations/  # Register, waitlist, cancel
│   │   │   ├── qr/             # Generate, validate, atomic check-in
│   │   │   ├── payments/       # Razorpay order, verify, webhook
│   │   │   ├── certificates/   # Puppeteer PDF, verify, bulk generate
│   │   │   ├── admin/          # Platform management, approvals
│   │   │   └── colleges/       # College and club endpoints
│   │   └── shared/
│   │       ├── errors/         # AppError class
│   │       ├── utils/          # apiResponse, asyncHandler, sanitize, email
│   │       └── constants/      # RBAC permissions
│   └── prisma/
│       ├── schema.prisma       # 15-table schema with RLS-ready design
│       ├── seed.ts             # Initial data (colleges, clubs, users)
│       └── seed-admin.ts       # Super Admin user
│
├── docker-compose.yml           # PostgreSQL 16 + PgBouncer + Redis 7
└── docker-compose.prod.yml      # Production overrides
```

### Multi-Tenancy Architecture

Eventura uses **Shared Database + Row-Level Security** pattern:

- Every tenant-scoped table has a mandatory `collegeId` field
- `Prisma $extends` query middleware automatically injects `collegeId` into every query
- Tenant context is propagated via `AsyncLocalStorage` — no manual passing required
- Super Admin bypasses isolation entirely
- Cross-college event visibility handled via `SharedEvent` pivot table

### QR Check-in Flow

```
Attendee registers → HMAC-signed QR token generated → stored in Redis (TTL = event end)
                                                     ↓
Event day: Scanner opens camera → scans QR → backend validates:
  1. Redis fast path — token exists?
  2. Atomic Redis SETNX lock — prevent race condition on simultaneous scans
  3. Prisma transaction — idempotent check-in update
  4. ScanLog created for audit trail
  5. Lock released
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 14 + TypeScript | App Router, SSR, image optimization |
| Styling | Tailwind CSS v3 | Utility-first, mobile-first responsive |
| State | Zustand + React Query | Client state + server state separation |
| Backend | Node.js + Express + TypeScript | Modular, fast, well-understood |
| ORM | Prisma | Type-safe queries, migration management |
| Database | PostgreSQL 16 | Relational, UUID PKs, Decimal money types |
| Connection Pool | PgBouncer (transaction mode) | Prevents connection exhaustion |
| Cache / Sessions | Redis 7 | Rate limiting, token blacklist, QR nonces |
| Auth | JWT (15m) + Refresh (7d) | Stateless, scalable |
| Payments | Razorpay Route | Indian payment rails, split payments |
| PDF | Puppeteer | Pixel-perfect branded certificates |
| Email | Resend | Transactional OTP and notifications |
| Storage | Cloudinary | Event banners, org logos |
| Infrastructure | Docker Compose | Local dev parity with production |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker Desktop
- Git

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/eventura-monorepo.git
cd eventura-monorepo
```

### 2. Start infrastructure

```bash
docker-compose up -d
```

Starts PostgreSQL 16, PgBouncer, and Redis 7. Wait for all three to show as healthy:

```bash
docker-compose ps
```

### 3. Set up backend

```bash
cd eventura-api
cp .env.example .env
# Fill in your keys (see Environment Variables section below)

npm install
npm run db:migrate
npm run db:seed
npm run db:seed-admin
npm run dev
```

Backend runs at `http://localhost:4000`

### 4. Set up frontend

```bash
cd ../eventura
cp .env.local.example .env.local
# Add: NEXT_PUBLIC_API_URL=http://localhost:4000

npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

### 5. Verify everything is running

```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "status": "ok",
  "services": {
    "database": "connected",
    "redis": "connected",
    "pgbouncer": "connected"
  }
}
```

---

## Environment Variables

### Backend (`eventura-api/.env`)

```env
# Database — connect through PgBouncer
DATABASE_URL="postgresql://eventura_user:eventura_secret@localhost:6432/eventura"

# Direct connection — for Prisma migrations only
DIRECT_URL="postgresql://eventura_user:eventura_secret@localhost:5433/eventura"

# Redis
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD="eventura_redis_secret"

# JWT — generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET="your-64-char-secret"
JWT_REFRESH_SECRET="your-different-64-char-secret"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# Razorpay — https://dashboard.razorpay.com/app/keys
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
RAZORPAY_WEBHOOK_SECRET="..."

# Cloudinary — https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Resend — https://resend.com/api-keys
RESEND_API_KEY="re_..."

# App
CLIENT_URL="http://localhost:3000"
PORT=4000
NODE_ENV="development"
```

### Frontend (`eventura/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
```

---

## Test Credentials

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| Attendee | `test@woxsen.edu.in` | `Test@1234` | `/dashboard` |
| Super Admin | `admin@eventura.app` | `Admin@1234` | `/admin/dashboard` |

### Creating an Organiser Account

1. Go to `/signup` → select **Club President**
2. Fill in details, select Woxsen University, enter club name
3. Verify email (OTP sent to email or check backend console in dev)
4. Login as Super Admin → `/admin/colleges` → approve the club
5. Login as Club President → redirected to `/org/dashboard`

---

## Roles

| Role | Scope | Permissions |
|------|-------|------------|
| **Super Admin** | Platform-wide | Approve orgs, platform settings, all data |
| **College Admin** | Their college | Create events, manage registrations, view payouts |
| **Club President** | Their club | Create events, manage registrations, view payouts |
| **Event Manager** | Per event (expires after event) | Scan QR codes, view attendee list |
| **Attendee** | Their own data | Browse events, register, view tickets, certificates |

A user can hold multiple roles simultaneously. After login, if multiple roles exist, a role switcher modal appears.

---

## API

All endpoints are prefixed with `/api/v1/`. Base URL: `http://localhost:4000`

### Authentication
```
POST   /api/v1/auth/signup              Create account
POST   /api/v1/auth/verify-email        Verify OTP
POST   /api/v1/auth/login               Login + get JWT
POST   /api/v1/auth/logout              Revoke tokens
POST   /api/v1/auth/refresh             Refresh access token
POST   /api/v1/auth/forgot-password     Request password reset OTP
POST   /api/v1/auth/reset-password      Reset password with OTP
POST   /api/v1/auth/context-switch      Switch active role
GET    /api/v1/auth/status              Get approval status
```

### Events
```
GET    /api/v1/events                   Browse published events
GET    /api/v1/events/:id               Event detail
POST   /api/v1/events                   Create event (organiser)
PATCH  /api/v1/events/:id               Update event (organiser)
POST   /api/v1/events/:id/publish       Publish event (organiser)
POST   /api/v1/events/:id/cancel        Cancel event (organiser)
DELETE /api/v1/events/:id               Delete draft (organiser)
GET    /api/v1/events/:id/readiness     Readiness score (organiser)
GET    /api/v1/events/:id/stats         Live stats (organiser)
GET    /api/v1/events/org/my-events     My org's events (organiser)
```

### Registrations
```
POST   /api/v1/registrations            Register for event
GET    /api/v1/registrations/my         My registrations
GET    /api/v1/registrations/my/:id     Single registration
POST   /api/v1/registrations/my/:id/cancel  Cancel registration
GET    /api/v1/registrations/event/:id  Event attendees (organiser)
```

### QR
```
GET    /api/v1/qr/:registrationId       Get QR data + nonce
POST   /api/v1/qr/validate              Validate scan (event manager)
```

### Payments
```
POST   /api/v1/payments/order           Create Razorpay order
POST   /api/v1/payments/verify          Verify payment signature
POST   /api/v1/payments/webhook         Razorpay webhook
GET    /api/v1/payments/org             Organiser payout dashboard
GET    /api/v1/payments/admin           Platform payments (super admin)
```

### Certificates
```
POST   /api/v1/certificates/generate    Generate certificate
GET    /api/v1/certificates/my          My certificates
GET    /api/v1/certificates/download/:id  Download PDF
GET    /api/v1/certificates/verify/:id   Public verification
POST   /api/v1/certificates/bulk        Bulk generate (organiser)
```

### Admin
```
GET    /api/v1/admin/stats              Platform stats
GET    /api/v1/admin/colleges           All colleges
GET    /api/v1/admin/colleges/pending   Pending approvals
POST   /api/v1/admin/colleges/:id/approve
POST   /api/v1/admin/colleges/:id/reject
POST   /api/v1/admin/colleges/:id/suspend
GET    /api/v1/admin/clubs/pending      Pending club approvals
POST   /api/v1/admin/clubs/:id/approve
POST   /api/v1/admin/clubs/:id/reject
GET    /api/v1/admin/users              All users
GET    /api/v1/admin/settings           Platform settings
PATCH  /api/v1/admin/settings           Update settings
GET    /api/v1/admin/audit              Audit log
GET    /api/v1/admin/health             Multi-tenant health
```

### Health
```
GET    /health                          Service health check
```

---

## Database Schema

15 tables across 3 categories:

**Global (no tenant scoping):**
`User`, `College`, `Role`, `Permission`, `PlatformSettings`

**Tenant-scoped (mandatory collegeId):**
`Club`, `RoleAssignment`, `Event`, `EventSession`, `SharedEvent`

**Transaction (scoped via relations):**
`Registration`, `Payment`, `RazorpayAccount`, `ScanLog`, `Waitlist`, `Certificate`, `EventFeedback`, `AuditLog`

---

## Security

| Feature | Implementation |
|---------|---------------|
| Authentication | JWT (15m) + HTTP-only refresh cookie (7d) |
| Token revocation | Redis blacklist on logout using jti |
| Brute force | 5 attempts → 15 min Redis lockout |
| Multi-tenancy | Prisma $extends auto-injects collegeId |
| XSS prevention | xss library on all request bodies |
| Security headers | Helmet with custom CSP |
| CORS | Strict origin whitelist |
| Rate limiting | Redis sliding window, per-endpoint limits |
| Payment security | Razorpay HMAC webhook signature verification |
| QR anti-fraud | HMAC-signed tokens + rotating Redis nonces (60s) |
| Idempotency | Unique keys on Registration and Payment |
| Audit trail | AuditLog on all sensitive operations |

---

## Useful Commands

```bash
# Start everything
docker-compose up -d
cd eventura-api && npm run dev
cd eventura && npm run dev

# Database
npm run db:migrate          # Run migrations
npm run db:seed             # Seed colleges, clubs, users
npm run db:seed-admin       # Create Super Admin user
npm run db:seed-events      # Seed sample events
npm run db:studio           # Open Prisma Studio (database browser)
npm run db:reset            # Reset + reseed (destructive)

# Docker
docker-compose up -d        # Start infrastructure
docker-compose down         # Stop infrastructure
docker-compose ps           # Check container status
docker-compose logs -f      # Follow logs

# Type checking
cd eventura-api && npx tsc --noEmit
cd eventura && npx tsc --noEmit
```

---

## Deployment

### Railway (Recommended)

1. Push to GitHub
2. Connect Railway to your repo
3. Add a PostgreSQL service and Redis service
4. Set environment variables (use Railway's internal URLs)
5. Change `DATABASE_URL` to Railway's PgBouncer URL
6. Change `DIRECT_URL` to Railway's direct PostgreSQL URL
7. Deploy

### Environment changes for production

```env
NODE_ENV="production"
CLIENT_URL="https://your-domain.com"
DATABASE_URL="railway-pgbouncer-url"
DIRECT_URL="railway-direct-postgres-url"
REDIS_URL="railway-redis-url"
```

---

## Roadmap

- [ ] Unit tests (Jest + Supertest)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Google OAuth integration
- [ ] Real-time notifications (WebSocket)
- [ ] BullMQ job queue for Puppeteer (async certificate generation)
- [ ] Swagger/OpenAPI documentation
- [ ] Sentry error monitoring
- [ ] Mobile PWA for QR scanning
- [ ] Event feedback and ratings UI
- [ ] Blockchain certificate verification

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
Built with ❤️ for Indian colleges and beyond.
</div>
