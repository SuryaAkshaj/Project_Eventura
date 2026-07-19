# Mission 29 + 30 — Audit Log

## Mission 29: Static QR Codes (Remove Nonce)

### Changes Made

| File | What Changed |
|------|-------------|
| `eventura-api/src/modules/qr/qr.routes.ts` | Replaced nonce-based QR with static HMAC-signed QR. GET returns `qrValue` (registrationId\|hmacToken). POST validates by recomputing HMAC instead of Redis nonce lookup. |
| `eventura-api/src/config/redis.ts` | Added `cleanupOldQRNonces()` to delete leftover `nonce:*` keys on Redis ready. |
| `eventura/lib/api/registrations.api.ts` | Updated `validateQR()` to send `{ qrValue, eventId }` instead of `{ qrToken, eventId }`. |
| `eventura/app/(attendee)/my-tickets/[id]/page.tsx` | Removed 55s setInterval refresh. QR value now uses `qrData.qrValue`. Removed "Refreshes every 60 seconds" text. |
| `eventura/app/(organiser)/org/events/[id]/scanner/page.tsx` | Updated `handleScan` to send full qrValue. Updated placeholder text. |

### What Was Removed
- Redis nonce generation (`setex` with 60s TTL)
- Redis nonce lookup on validation
- Redis QR cache (`qr:` key prefix)
- Frontend 55-second polling interval
- "Refreshes every 60 seconds" UI text

### What Was Added
- `generateStaticQRToken()` — HMAC-SHA256 of `registrationId:userId` using JWT_SECRET
- HMAC verification in POST /validate
- `cleanupOldQRNonces()` in redis.ts

---

## Mission 30: Remove Approval Entirely

### Changes Made

| File | What Changed |
|------|-------------|
| `eventura-api/src/modules/auth/auth.service.ts` | COLLEGE_ADMIN signup: college created as `APPROVED` with `approvedAt`, role assignment `APPROVED`. CLUB_PRESIDENT signup: club created as `APPROVED` with `approvedAt`, role assignment `APPROVED`. Removed college approval status check for CLUB_PRESIDENT. |
| `eventura/app/(public)/signup/pending-approval/page.tsx` | Simplified to show "You're Approved!" and auto-redirect to `/login` in 2 seconds. Removed polling, timeline, and pending state UI. |

### What Was Removed
- `PENDING` status on college creation (now `APPROVED`)
- `PENDING` status on club creation (now `APPROVED`)
- `PENDING` status on role assignments for COLLEGE_ADMIN and CLUB_PRESIDENT (now `APPROVED`)
- `college.approvalStatus !== 'APPROVED'` check for CLUB_PRESIDENT signup
- 30-second polling interval on pending-approval page
- Multi-step timeline UI

---

## Verification Results

- `npx tsc --noEmit` (backend): ✅ 0 errors
- `npx tsc --noEmit` (frontend): ✅ 0 errors
