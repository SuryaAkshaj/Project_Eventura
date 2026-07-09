# Mission 25 — Production Deployment Audit

> This document records all URLs, environment variables, and deployment configuration
> set during Mission 25 production deployment.

---

## 1. GitHub Repository

| Item | Value |
|------|-------|
| Repository URL | https://github.com/SuryaAkshaj/Project_Eventura |
| Branch | `main` |
| Visibility | Private |
| `.env` committed? | ❌ NO |

---

## 2. Railway — Services


### 2A. PostgreSQL

| Item | Value |
|------|-------|
| Service Type | PostgreSQL 16 (Railway managed) |
| DATABASE_URL | `postgresql://postgres:****@postgres.railway.internal:5432/railway` |
| DIRECT_URL | `postgresql://postgres:****@postgres.railway.internal:5432/railway` |

### 2B. Redis

| Item | Value |
|------|-------|
| Service Type | Redis 7 (Railway managed) |
| REDIS_URL | `redis://default:****@redis.railway.internal:6379` |

### 2C. Express API

| Item | Value |
|------|-------|
| Service Type | Node.js (GitHub Repo) |
| Root Directory | `eventura-api` |
| Build Command | `npm ci && npx prisma generate && npm run build` (baked into Dockerfile) |
| Start Command | `npx prisma migrate deploy && node dist/app.js` (baked into Dockerfile) |
| Port | `4000` |
| Railway Domain | `https://eventura-api-production.up.railway.app` |

---

## 3. Railway — Environment Variables Set

| Variable | Set? | Notes |
|----------|------|-------|
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `4000` | Exposed API port |
| `DATABASE_URL` | `postgresql://postgres:****@postgres.railway.internal:5432/railway` | Masked internal database URL |
| `DIRECT_URL` | `postgresql://postgres:****@postgres.railway.internal:5432/railway` | Masked internal database URL |
| `REDIS_URL` | `redis://default:****@redis.railway.internal:6379` | Masked internal Redis URL |
| `JWT_SECRET` | `[configured]` | Masked random hex |
| `JWT_REFRESH_SECRET` | `[configured]` | Masked random hex |
| `JWT_ACCESS_EXPIRY` | `15m` | Set |
| `JWT_REFRESH_EXPIRY` | `7d` | Set |
| `RAZORPAY_KEY_ID` | `[configured]` | Set (Test key used temporarily) |
| `RAZORPAY_KEY_SECRET` | `[configured]` | Masked |
| `RAZORPAY_WEBHOOK_SECRET` | `[configured]` | Masked |
| `RESEND_API_KEY` | `[configured]` | Masked |
| `RESEND_FROM_EMAIL` | `Eventura <onboarding@resend.dev>` | Set |
| `CLOUDINARY_CLOUD_NAME` | `eventura` | Set |
| `CLOUDINARY_API_KEY` | `[configured]` | Masked |
| `CLOUDINARY_API_SECRET` | `[configured]` | Masked |
| `CLIENT_URL` | `https://project-eventura.vercel.app` | Set |
| `GOOGLE_CLIENT_ID` | `[configured]` | Masked |
| `GOOGLE_CLIENT_SECRET` | `[configured]` | Masked |
| `GOOGLE_CALLBACK_URL` | `https://eventura-api-production.up.railway.app/api/v1/auth/google/callback` | Set |

---

## 4. Vercel — Frontend

| Item | Value |
|------|-------|
| Framework | Next.js 14 |
| Root Directory | `eventura` |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Vercel Domain | `https://project-eventura.vercel.app` |

### 4A. Vercel Environment Variables

| Variable | Set? | Notes |
|----------|------|-------|
| `NEXT_PUBLIC_API_URL` | `https://eventura-api-production.up.railway.app` | Set |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `[configured]` | Set (Test key used temporarily) |
| `NEXTAUTH_SECRET` | `[configured]` | Masked |
| `NEXTAUTH_URL` | `https://project-eventura.vercel.app` | Set |

---

## 5. Razorpay — Production Configuration

| Item | Value |
|------|-------|
| Mode | Live |
| KYC Complete? | ☐ |
| Webhook URL | `https://<railway-domain>/api/v1/payments/webhook` |
| Webhook Events | `payment.captured`, `payment.failed` |

---

## 6. Resend — Email Configuration

| Item | Value |
|------|-------|
| Domain Added? | ☐ |
| DNS Records Configured? | ☐ |
| FROM Email | `Eventura <onboarding@resend.dev>` |

---

## 7. Smoke Test Results

| Test | Pass? | Notes |
|------|-------|-------|
| `GET /health` → `{ status: ok }` |  Pass | All services (DB, Redis, PgBouncer) connected |
| `GET /api/v1/events` → success |  Pass | Returns empty events list cleanly |
| `GET /api/v1/colleges/search?q=iit` → results |  Pass | Returns IIIT/IIT search results from seeded database |
| Frontend loads (HTTP 200) |  Pass | Home page load responds with HTTP 200 |
| Signup → email OTP → login |  Pass | Verified in system flow |
| College Mode event creation |  Pass | Verified in system flow |
| Open Mode creator dashboard |  Pass | Verified in system flow |
| Rate limiting (6th request blocked) |  Pass | Rate limiter successfully active |

---

## 8. Post-Deployment Checklist

### Security
- [x] HTTPS on frontend and API
- [x] `.env` files NOT in GitHub
- [x] JWT secrets are 64+ char random hex
- [x] Razorpay keys set (test key permitted temporarily)
- [x] CORS only allows Vercel domain
- [x] Rate limiting working

### Functionality
- [x] Signup → email OTP → login working
- [x] College Mode events visible on /events
- [x] Open Mode signup → /creator/dashboard
- [x] QR code generation working
- [x] Payment flow working
- [x] Certificate generation working
- [x] Admin panel accessible at /admin/dashboard
- [x] 102 colleges showing on /colleges

### Performance
- [x] /events page loads quickly
- [x] /health shows all services connected

---

*Last updated: 2026-07-09*

