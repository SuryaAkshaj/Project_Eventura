# Mission 28 Audit — Fix Dev Mode Banner + Google OAuth End to End

**Date:** 2026-07-15
**Status:** ✅ Complete

---

## Changes Made

### PART 1 — Fix Dev Mode OTP Banner

#### `eventura/app/(public)/signup/verify-email/page.tsx`
- **What:** Wrapped the dev mode OTP banner (lines 80–87) with `process.env.NODE_ENV === 'development'` conditional
- **Why:** Banner was always rendered, including in production where users get OTPs via email (Resend)
- **Pattern:** Was Pattern C (always shown); changed to use `process.env.NODE_ENV === 'development'` check

#### `eventura/app/(public)/forgot-password/page.tsx`
- **What:** Changed info message from `'OTP sent to server console (dev mode). Check your eventura-api terminal.'` to production-friendly `'If an account exists with that email, a reset OTP has been sent. Check your inbox and spam folder.'`
- **Why:** Dev-specific wording was exposed to production users

---

### PART 2 — Backend: Google Strategy

#### `src/modules/auth/google.strategy.ts` [NEW]
- Created `initGoogleStrategy()` function using `passport-google-oauth20`
- Reads `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` from `process.env` (not Zod `env` — allows server to boot without Google credentials)
- On callback:
  - Finds user by `googleId` OR `email`
  - Existing user: links `googleId` if not already set
  - New user: creates with `isEmailVerified: true`, determines `accountMode` from email domain (checks college table), sets `orgCategory`, generates username, creates ATTENDEE role assignment
- Duplicated helper functions (`getOrCreateRole`, `generateUsername`, `getOrCreateDefaultCollegeId`) from `auth.service.ts` to avoid circular imports

---

### PART 3 — Backend: Google Routes

#### `src/modules/auth/auth.routes.ts` [MODIFIED]
- Added `import passport from 'passport'`
- Added `import { env } from '@config/env'`
- Added `import { generateTokenPair } from './auth.service'`
- Added `GET /google` route — passes `orgType` from query as OAuth `state` parameter
- Added `GET /google/callback` route — generates JWT with full `activeContext` including org labels (same labels map as `auth.service.ts`), updates `lastLoginAt`, redirects to frontend `/auth/google/success` with `token`, `mode`, `role` params

---

### PART 4 — Backend: Passport Initialization

#### `src/app.ts` [MODIFIED]
- Added `import passport from 'passport'`
- Added `import { initGoogleStrategy } from '@modules/auth/google.strategy'`
- Added `app.use(passport.initialize())` and `initGoogleStrategy()` after rate limiting, before routes

---

### PART 5 — Frontend: Google Success Page

#### `eventura/app/(public)/auth/google/success/page.tsx` [NEW]
- Reads `token`, `mode`, `role` from URL search params
- Calls `/auth/me` with token to get user profile
- Attempts `/auth/refresh` to get full `activeContext` with labels
- Falls back to default context if refresh fails
- Stores auth in Zustand via `setAuth()`
- Sets `eventura-auth` cookie (15 min) and `eventura-mode` cookie (7 days)
- Redirects based on role/mode (same logic as login page)
- Wrapped in `<Suspense>` for `useSearchParams()`

---

### PART 6 — Frontend: Login Page Google Button

#### `eventura/app/(public)/login/page.tsx` [MODIFIED]
- Replaced disabled "Coming Soon" button with working `<a>` link to `${NEXT_PUBLIC_API_URL}/api/v1/auth/google`
- Conditionally renders based on `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — shows working link if set, disabled button with "Setup required" badge if not
- Added `googleError` from `searchParams.get('error')`
- Added red error banner when `error=google_failed` in URL

---

### PART 7 — Frontend: Signup Page Google Button

#### `eventura/app/(public)/signup/page.tsx` [MODIFIED]
- Added Google OAuth button inside the registration form step
- Links to `${NEXT_PUBLIC_API_URL}/api/v1/auth/google?orgType=${orgType}` to pass selected org type
- Includes "or sign up with email" divider
- Only shown when `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set

---

### PART 8 — Frontend: Google Error Handling

#### (Included in Part 6 — Login page)
- Reads `error` query param from URL
- Shows red error banner with Material icon when `error=google_failed`

---

### NPM Dependencies Added

**Backend (`eventura-api`):**
- `passport` (runtime)
- `passport-google-oauth20` (runtime)
- `@types/passport` (dev)
- `@types/passport-google-oauth20` (dev)

---

## TypeScript Verification

| Project | Result |
|---------|--------|
| `eventura` (frontend) | ✅ 0 errors |
| `eventura-api` (backend) | ✅ 0 new errors (4 pre-existing errors in `profile/:username` route — unrelated to Mission 28) |

---

## Files Touched — Complete List

**Backend:**
- `src/modules/auth/google.strategy.ts` — NEW
- `src/modules/auth/auth.routes.ts` — MODIFIED (added imports + 2 Google routes)
- `src/app.ts` — MODIFIED (added passport init + strategy activation)
- `package.json` / `package-lock.json` — MODIFIED (new dependencies)

**Frontend:**
- `app/(public)/signup/verify-email/page.tsx` — MODIFIED (wrapped dev banner)
- `app/(public)/forgot-password/page.tsx` — MODIFIED (production-friendly message)
- `app/(public)/login/page.tsx` — MODIFIED (Google button + error handling)
- `app/(public)/signup/page.tsx` — MODIFIED (Google button with orgType)
- `app/(public)/auth/google/success/page.tsx` — NEW

**No other files were touched.**
