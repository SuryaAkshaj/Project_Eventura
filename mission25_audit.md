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
| DATABASE_URL | `<paste Railway PgBouncer URL here>` |
| DIRECT_URL | `<paste Railway direct URL here>` |

### 2B. Redis

| Item | Value |
|------|-------|
| Service Type | Redis 7 (Railway managed) |
| REDIS_URL | `<paste Railway Redis URL here>` |

### 2C. Express API

| Item | Value |
|------|-------|
| Service Type | Node.js (GitHub Repo) |
| Root Directory | `eventura-api` |
| Build Command | `npm ci && npx prisma generate && npm run build` |
| Start Command | `npm run db:migrate:prod && node dist/app.js` |
| Port | `4000` |
| Railway Domain | `<paste generated Railway domain here>` |

---

## 3. Railway — Environment Variables Set

| Variable | Set? | Notes |
|----------|------|-------|
| `NODE_ENV` | ☐ | `production` |
| `PORT` | ☐ | `4000` |
| `DATABASE_URL` | ☐ | Railway PostgreSQL PgBouncer URL |
| `DIRECT_URL` | ☐ | Railway PostgreSQL direct URL |
| `REDIS_URL` | ☐ | Railway Redis URL |
| `JWT_SECRET` | ☐ | 64-char random hex |
| `JWT_REFRESH_SECRET` | ☐ | Different 64-char random hex |
| `JWT_ACCESS_EXPIRY` | ☐ | `15m` |
| `JWT_REFRESH_EXPIRY` | ☐ | `7d` |
| `RAZORPAY_KEY_ID` | ☐ | Live key (`rzp_live_...`) |
| `RAZORPAY_KEY_SECRET` | ☐ | Live secret |
| `RAZORPAY_WEBHOOK_SECRET` | ☐ | From Razorpay webhook config |
| `RESEND_API_KEY` | ☐ | `re_...` |
| `RESEND_FROM_EMAIL` | ☐ | `Eventura <onboarding@resend.dev>` (or custom domain) |
| `CLOUDINARY_CLOUD_NAME` | ☐ | |
| `CLOUDINARY_API_KEY` | ☐ | |
| `CLOUDINARY_API_SECRET` | ☐ | |
| `CLIENT_URL` | ☐ | Vercel frontend URL |
| `GOOGLE_CLIENT_ID` | ☐ | Optional |
| `GOOGLE_CLIENT_SECRET` | ☐ | Optional |
| `GOOGLE_CALLBACK_URL` | ☐ | `https://<railway-domain>/api/v1/auth/google/callback` |

---

## 4. Vercel — Frontend

| Item | Value |
|------|-------|
| Framework | Next.js 14 |
| Root Directory | `eventura` |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Vercel Domain | `<paste Vercel URL here>` |

### 4A. Vercel Environment Variables

| Variable | Set? | Notes |
|----------|------|-------|
| `NEXT_PUBLIC_API_URL` | ☐ | Railway API URL |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | ☐ | Live key (`rzp_live_...`) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | ☐ | Optional |

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
| `GET /health` → `{ status: ok }` | ☐ | |
| `GET /api/v1/events` → success | ☐ | |
| `GET /api/v1/colleges/search?q=iit` → results | ☐ | |
| Frontend loads (HTTP 200) | ☐ | |
| Signup → email OTP → login | ☐ | |
| College Mode event creation | ☐ | |
| Open Mode creator dashboard | ☐ | |
| Rate limiting (6th request blocked) | ☐ | |

---

## 8. Post-Deployment Checklist

### Security
- [ ] HTTPS on frontend and API
- [ ] `.env` files NOT in GitHub
- [ ] JWT secrets are 64+ char random hex
- [ ] Razorpay live keys in use
- [ ] CORS only allows Vercel domain
- [ ] Rate limiting working

### Functionality
- [ ] Signup → email OTP → login working
- [ ] College Mode events visible on /events
- [ ] Open Mode signup → /creator/dashboard
- [ ] QR code generation working
- [ ] Payment flow working (test with ₹1 event)
- [ ] Certificate generation working
- [ ] Admin panel accessible at /admin/dashboard
- [ ] 102 colleges showing on /colleges

### Performance
- [ ] /events page loads in < 2 seconds
- [ ] /health shows all services connected

---

*Last updated: <!-- fill in date -->*
