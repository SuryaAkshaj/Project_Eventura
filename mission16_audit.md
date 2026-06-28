# Mission 16 Audit

## Summary
Fixed 3 issues: org members using mock data, org settings not persisting, admin users role column always blank.

---

## Fix 1 — Admin Users Role Column (Part 1)

**Issue:** `user.roleAssignments?.[0]?.role?.name` was returning `undefined` because users had no approved role assignments, or roles were not being formatted.

**Root cause:** The backend `getAllUsers` in `admin.service.ts` was already correct — it includes `role: { select: { name: true } }`. The issue was the frontend showing raw DB strings (e.g. `CLUB_PRESIDENT`) and no graceful fallback for multiple data shapes.

**Fix:**
- `eventura/app/(admin)/admin/users/page.tsx`:
  - Added multi-shape resolution: tries `role.name` (Shape A), `roleName` (Shape B), `role` as string (Shape C), falls back to `'ATTENDEE'`
  - Added formatting: `CLUB_PRESIDENT` → `Club President`
  - Added colored role badge (purple for Club President, blue for College Admin, etc.)

---

## Fix 2 — Org Members (Part 2)

**Issue:** `org/members/page.tsx` used `mockOrgMembers` — static data hardcoded in the file. No backend endpoint existed to serve real member data.

**Backend changes — `src/modules/colleges/colleges.routes.ts`:**
- Added `GET /api/v1/colleges/my-members`:
  - Uses `req.user!.activeContext.collegeRole` + `collegeId` + `clubId`
  - `CLUB_PRESIDENT` sees only members in their club (filtered by `clubId`)
  - `COLLEGE_ADMIN` sees all members in the college
  - Returns: `id, firstName, lastName, email, avatarUrl, role, clubName, lastActive, assignmentId, expiresAt`
- Added `POST /api/v1/colleges/appoint-manager`:
  - Validates event belongs to organiser's college
  - Upserts a `EVENT_MANAGER` role assignment expiring at the event's end date
  - Logs to audit trail

**Frontend changes:**
- Created `eventura/lib/api/members.api.ts` with `getMyMembers()` and `appointEventManager()`
- Replaced `org/members/page.tsx`:
  - Removed all `mockOrgMembers` / `mockOrgEvents` imports
  - Added `useEffect` to call `membersApi.getMyMembers()` on mount
  - Added loading skeleton, empty state
  - Stats cards now show real role distribution (Club Presidents, Event Managers)
  - Preserved all existing UI design tokens (Dialog, Table, Button, etc.)

---

## Fix 3 — Org Settings (Part 3)

**Issue:** The "Save Changes" button in `org/settings/page.tsx` only did `setProfileSaved(true)` — it never called any API. Org name/domain/website/address were hardcoded placeholders.

**Backend changes — `src/modules/colleges/colleges.routes.ts`:**
- Added `GET /api/v1/colleges/my-org`:
  - Returns college: `id, name, domain, logoUrl, brandingColor, website, address`
  - If `CLUB_PRESIDENT`, also returns club: `id, name, description, logoUrl`
- Added `PATCH /api/v1/colleges/my-org`:
  - `COLLEGE_ADMIN` can update `website` and `address`
  - `CLUB_PRESIDENT` can update `clubName` and `clubDescription`
  - College name/domain are intentionally read-only (require Super Admin)
  - Logs to audit trail with `ORG_SETTINGS_UPDATED` action

**Frontend changes:**
- Created `eventura/lib/api/org.api.ts` with `getMyOrg()` and `updateMyOrg()`
- Updated `org/settings/page.tsx`:
  - Added `useEffect` to call `orgApi.getMyOrg()` on mount
  - Pre-fills website, address, orgName (read-only), domain (read-only)
  - For Club Presidents: also shows club name + description fields
  - `handleSaveProfile()` calls `orgApi.updateMyOrg()` with real data
  - Added loading skeleton while fetching
  - Added success banner (green) and error banner on failure
  - Save button is disabled while loading or saving
  - Branding tab and Bank tab remain UI-only (unchanged)

---

## Files Touched

| File | Action |
|------|--------|
| `eventura-api/src/modules/colleges/colleges.routes.ts` | Modified — 4 new endpoints added |
| `eventura/lib/api/members.api.ts` | Created |
| `eventura/lib/api/org.api.ts` | Created |
| `eventura/app/(admin)/admin/users/page.tsx` | Modified — role formatting + badge |
| `eventura/app/(organiser)/org/members/page.tsx` | Modified — replaced mock with real API |
| `eventura/app/(organiser)/org/settings/page.tsx` | Modified — wired real API for profile tab |

---

## Verification

- ✅ `cd eventura-api && npx tsc --noEmit` — 0 errors
- ✅ `cd eventura && npx tsc --noEmit` — 0 errors

## Manual Checks
1. Login as Club President → `/org/members` → real members show (not mock)
2. `/org/settings` → Org Profile tab pre-filled with real college name, domain, website
3. Change website → Save Changes → success banner shows
4. Reload → new website value persists
5. Login as Super Admin → `/admin/users` → Role column shows formatted names (e.g. "Club President" not "CLUB_PRESIDENT")
