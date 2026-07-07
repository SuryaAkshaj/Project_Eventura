# Mission 22 — Audit Log

All fixes applied on 2026-07-01.

---

## Fix 1 — Sliding Window Rate Limiter ✅

**File:** `src/middleware/rateLimiter.middleware.ts`
**Change:** Replaced fixed-window `INCR` rate limiter with true sliding window using Redis sorted sets (`ZRANGEBYSCORE`, `ZADD`, `ZCARD`).
**Impact:** Eliminates window-boundary exploit where users could make 2× the allowed requests by timing requests at window edges.

**New rate limiters added:**
| Limiter | Scope | Limit | Window |
|---------|-------|-------|--------|
| `loginRateLimiter` | Per email | 5 | 15 min |
| `forgotPasswordRateLimiter` | Per email | 3 | 1 hour |
| `otpRateLimiter` | Per email | 5 | 1 hour |
| `paymentRateLimiter` | Per userId | 10 | 1 min |
| `bulkCertRateLimiter` | Per userId | 5 | 1 hour |
| `adminRateLimiter` | Per adminId | 500 | 1 min |

**Routes updated:**
- `auth.routes.ts` — login, verify-email, forgot-password, reset-password
- `qr.routes.ts` — /validate
- `payments.routes.ts` — /order
- `certificates.routes.ts` — /bulk
- `admin.routes.ts` — router.use() chain

---

## Fix 2 — Remove Broken Tenant Middleware ✅

**File:** `src/middleware/tenant.middleware.ts` → **DELETED**
**Reason:** `set_config()` with `local=true` only persists within a single transaction. With PgBouncer in transaction mode, each query gets a different connection — the session variable is never available. Prisma `$extends` in `database.ts` already handles tenant isolation correctly.
**Verification:** `grep -rn "tenantMiddleware" src/` returns 0 results — no imports existed in route files.

---

## Fix 3 — JWT Secret Validation ✅

**File:** `src/config/env.ts`
**Changes:**
- JWT_SECRET minimum: 32 → 64 characters
- Added `.refine()` to reject weak/placeholder values (secret, jwt-secret, change-me, eventura)
- JWT_REFRESH_SECRET must differ from JWT_SECRET
- Added production env checks: HTTPS required, no test Razorpay keys, no localhost DB/Redis

---

## Fix 4 — Composite Indexes ✅

**File:** `prisma/schema.prisma`
**Added 20 composite indexes:**
- Event: 6 (collegeId+status, collegeId+startDate, status+startDate, 3-col, visibility combo, eventType combo)
- Registration: 5 (eventId+status, userId+status, userId+createdAt, eventId+createdAt, eventId+paymentStatus)
- AuditLog: 3 (userId+createdAt, action+createdAt, eventId+createdAt)
- Payment: 2 (status+createdAt, registrationId+status)
- EventFeedback: 2 (eventId+rating, eventId+createdAt)
- Bookmark: 1 (userId+createdAt)
- Certificate: 1 (registrationId+issuedAt)

**Note:** Migration (`prisma migrate dev --name add_composite_indexes`) must be run separately when Docker containers are up.

---

## Fix 5 — Graceful Shutdown ✅

**File:** `src/app.ts`
**Changes:**
- `isShuttingDown` guard prevents duplicate shutdown
- Disconnects Prisma (both tenant + admin) and Redis before exit
- 30-second forced kill timeout via `setTimeout().unref()`
- Added `unhandledRejection` handler (throws in dev, logs in prod)
- Added `uncaughtException` handler → triggers shutdown

---

## Fix 6 — Response Caching ✅

**New file:** `src/shared/utils/cache.ts`
**Features:**
- `withCache<T>()` — generic cache-aside with configurable TTL
- TTL constants: EVENT_LIST=60s, EVENT_DETAIL=30s, COLLEGE_LIST=300s, PLATFORM_STATS=120s
- `invalidateEventListCache()` — pattern-based key deletion
- `invalidateEventCache()` / `invalidatePlatformStats()` — single key deletion
- Fails gracefully on Redis errors (logs warning, continues to DB)

**Applied in:**
- `events.service.ts` — `getEvents()` cached, invalidation on create/update/publish/cancel
- `admin.service.ts` — `getPlatformStats()` cached, invalidation on approve/reject college

---

## Fix 7 — Pagination Utility ✅

**New file:** `src/shared/utils/pagination.ts`
**Features:**
- `getPagination()` — extracts page/limit/skip from query, enforces MAX_PAGE_SIZE=100
- `paginatedResponse()` — wraps data with consistent meta (total, page, limit, totalPages, hasNextPage, hasPrevPage)
- Throws `AppError` if requested limit > 100

**Applied in:**
- `events.service.ts` — `getEvents()`, `getOrgEvents()`
- `admin.service.ts` — `getAllColleges()`, `getAllUsers()`, `getAuditLog()`, `getAllEvents()`

---

## Fix 8 — Prisma SELECT Objects ✅

**New file:** `src/modules/events/event.selects.ts`
**Features:**
- `EVENT_LIST_SELECT` — 22 fields + college, club, _count relations
- `EVENT_DETAIL_SELECT` — extends list with description, rules, contact info, timestamps
- Uses `satisfies Prisma.EventSelect` for type safety

**Applied in:**
- `events.service.ts` — `getEvents()` uses `select: EVENT_LIST_SELECT` instead of `include`

---

## Fix 9 — Slow Query Logging ✅

**File:** `src/config/database.ts`
**Change:** Added `prismaAdmin.$on('query')` handler that warns on queries > 1000ms. Development mode only.
**Note:** Only applies to `prismaAdmin` (base PrismaClient). The extended `prisma` client doesn't expose `$on`.

---

## Fix 10 — Enhanced Security Headers ✅

**File:** `src/app.ts`
**Changes:**
- CSP: Added `https://lumberjack.razorpay.com` to connectSrc
- CSP: Changed frameSrc from Razorpay API to `'none'`
- CSP: Added `objectSrc: ['none']`, `upgradeInsecureRequests` (prod only)
- Added `referrerPolicy: strict-origin-when-cross-origin`
- Added custom middleware for `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
- Added `X-Content-Type-Options: nosniff` and `X-Frame-Options: DENY`

---

## Fix 11 — Enhanced Health Endpoint ✅

**File:** `src/modules/health/health.routes.ts`
**Changes:**
- Added: `uptime`, `responseTime`, `version`, `environment` fields
- Simplified: PgBouncer check derived from database status (no separate connection)
- Removed: `pg` Client import and manual PgBouncer connection (was opening new connection per health check)

---

## Verification

- **TypeScript:** `npx tsc --noEmit` → 0 errors ✅
- **Tenant middleware removed:** No references remain ✅
- **Migration:** Schema prepared, must run `prisma migrate dev --name add_composite_indexes` when containers are up ⏳
