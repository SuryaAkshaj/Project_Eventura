# Mission 27 Audit — Fix Production Signup: Role Configuration Error

**Date:** 2026-07-09
**Status:** Code changes complete — pending production seed execution

---

## Problem

Users signing up at `/signup` get **"Role configuration error"** because:
1. `prisma migrate deploy` creates tables but never seeds data
2. The `Role` table in production has 0 rows
3. `auth.service.ts` calls `role.findUnique({ where: { name: 'ATTENDEE' } })` → returns `null`
4. Throws `AppError('ROLE_CONFIG_ERROR', 'Role configuration error', 500)`

---

## Changes Made

### 1. `src/modules/auth/auth.service.ts` — MODIFIED

**What changed:**
- Added `ROLE_DB_PERMISSIONS` map — stores the exact permissions each role should have in the Permission table (mirrors `seed.ts`)
- Added `getOrCreateRole(roleName)` helper — uses `prismaAdmin.role.upsert()` to auto-create a role with its permissions if it doesn't exist
- Replaced `role.findUnique` + error throw at line 186 with `getOrCreateRole()` call
- Added `import type { RoleName } from '@prisma/client'`

**Why:**
The signup function now self-heals — if a role is missing from the database, it creates it on the fly instead of throwing an error. This makes signup resilient to missing seed data.

### 2. `src/modules/colleges/colleges.routes.ts` — MODIFIED

**What changed:**
- Replaced `role.findUnique` for `EVENT_MANAGER` (line 207) with `role.upsert`
- Removed the error response block that returned 404 when role was missing
- The upsert creates the EVENT_MANAGER role with its permissions if missing

**Why:**
Same self-healing pattern — assigning an Event Manager role to a user should not fail just because the Role table wasn't seeded.

### 3. `prisma/seed-production.ts` — NEW

**What it does:**
- Seeds all 5 roles (SUPER_ADMIN, COLLEGE_ADMIN, CLUB_PRESIDENT, EVENT_MANAGER, ATTENDEE) with full permissions
- Creates PlatformSettings singleton
- Creates Super Admin user (admin@eventura.app / Admin@1234)
- Creates a system college (eventura.app) if no approved college exists
- Uses findFirst + create for RoleAssignment (avoids null composite key issue with clubId)
- Fully idempotent — safe to run multiple times

**Permission set matches `seed.ts` exactly.**

### 4. `package.json` — MODIFIED

**What changed:**
- Added `"db:seed-production": "ts-node prisma/seed-production.ts"` script

### 5. `admin.service.ts` — NOT MODIFIED

**Why:** No `role.findUnique` calls found in this file. The mission doc mentioned it but the current codebase doesn't need it.

---

## Files NOT Touched

- No frontend files modified
- No migration files created
- No `prisma migrate dev` run
- `admin.service.ts` — no role lookups found

---

## Build Verification

- `npm run build` — all 4 TypeScript errors are **pre-existing** in `auth.routes.ts` (username lookup and roleAssignments include issues)
- **Zero new errors** introduced by Mission 27 changes
- All errors are in `auth.routes.ts`, not in any files modified by this mission

---

## Next Steps — Production Deployment

1. Push changes to trigger Railway auto-deploy
2. Run production seed via one of:
   - `railway run npm run db:seed-production`
   - Temporarily add to Railway start command: `npx prisma migrate deploy && npm run db:seed-production && node dist/app.js`
3. Verify signup at https://project-eventura.vercel.app/signup
4. Verify Super Admin login at https://project-eventura.vercel.app/login
5. Revert Railway start command if modified
