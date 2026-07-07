# Mission 23 Audit Log

This document records the modifications made to the Eventura codebase to satisfy all requirements of Mission 23.

## 1. Audit Log Schema Enhancement
- **File modified:** [schema.prisma](file:///c:/Users/surya/OneDrive/Desktop/eventura-monorepo/eventura-api/prisma/schema.prisma)
  - Updated `AuditLog` model to include:
    - `collegeId` (UUID)
    - `resourceType` (String)
    - `resourceId` (String)
    - `result` (String, default "SUCCESS")
    - `userAgent` (String)
  - Added new composite indexes:
    - `@@index([collegeId, createdAt])`
    - `@@index([resourceType, resourceId])`
- **Migration executed:** `20260702182442_enhance_audit_log` applied successfully via Prisma CLI.
- **Express Types updated:** [express.d.ts](file:///c:/Users/surya/OneDrive/Desktop/eventura-monorepo/eventura-api/src/shared/types/express.d.ts)
  - Declared optional `ipAddress` and `userAgent` on the global Express Request interface.
- **Middleware updated:** [auth.middleware.ts](file:///c:/Users/surya/OneDrive/Desktop/eventura-monorepo/eventura-api/src/middleware/auth.middleware.ts)
  - Extracted client IP address (supporting proxy via `x-forwarded-for`) and browser user-agent from headers and set on the request object.
- **Services updated:**
  - [admin.service.ts](file:///c:/Users/surya/OneDrive/Desktop/eventura-monorepo/eventura-api/src/modules/admin/admin.service.ts)
    - Enhanced audit logs inside `approveCollege`, `rejectCollege`, `suspendCollege`, `approveClub`, `rejectClub`, and `updatePlatformSettings` functions.
  - [certificates.service.ts](file:///c:/Users/surya/OneDrive/Desktop/eventura-monorepo/eventura-api/src/modules/certificates/certificates.service.ts)
    - Enhanced audit log inside `generateCertificate` function.

## 2. Legal Pages
- **Terms of Service:** [terms/page.tsx](file:///c:/Users/surya/OneDrive/Desktop/eventura-monorepo/eventura/app/(public)/terms/page.tsx)
  - Overwrote placeholder with full 10-section Terms of Service.
- **Privacy Policy:** [privacy/page.tsx](file:///c:/Users/surya/OneDrive/Desktop/eventura-monorepo/eventura/app/(public)/privacy/page.tsx)
  - Overwrote placeholder with full 7-section Privacy Policy.
- **Refund Policy:** [refunds/page.tsx](file:///c:/Users/surya/OneDrive/Desktop/eventura-monorepo/eventura/app/(public)/refunds/page.tsx)
  - Created a new page with a cancellation rules table and processing timelines.
- **IP Policy:** [ip-policy/page.tsx](file:///c:/Users/surya/OneDrive/Desktop/eventura-monorepo/eventura/app/(public)/ip-policy/page.tsx)
  - Created a new page outlining trademarks, organiser content ownership, DMCA takedown flow, and platform liability.
- **Footer Updates:** [page.tsx](file:///c:/Users/surya/OneDrive/Desktop/eventura-monorepo/eventura/app/(public)/page.tsx)
  - Added the Refunds link to the footer navigation links.

## 3. Cookie Consent Banner
- **Banner Component:** [CookieConsent.tsx](file:///c:/Users/surya/OneDrive/Desktop/eventura-monorepo/eventura/components/ui/CookieConsent.tsx)
  - Implemented client-side cookie consent banner that slides in after 1s.
  - Saves choice (accepted/rejected) along with a timestamp in `localStorage`.
  - Expiry is set to 90 days.
- **Layout Integration:** [layout.tsx](file:///c:/Users/surya/OneDrive/Desktop/eventura-monorepo/eventura/app/layout.tsx)
  - Rendered `<CookieConsent />` globally at the root level of the app.

## 4. Swagger / OpenAPI Documentation
- **Dependencies installed:** `swagger-ui-express` and `swagger-jsdoc` (with `@types/` dev dependencies).
- **Swagger Configuration:** [swagger.ts](file:///c:/Users/surya/OneDrive/Desktop/eventura-monorepo/eventura-api/src/config/swagger.ts)
  - Created OpenAPI configuration containing general API metadata, server targets, schema schemas (Error, PaginationMeta), tag configurations, and Bearer security schemes.
- **Express App Mount:** [app.ts](file:///c:/Users/surya/OneDrive/Desktop/eventura-monorepo/eventura-api/src/app.ts)
  - Mounted Swagger UI on `/api/docs` and exposed raw specification on `/api/docs.json`.
- **JSDoc Routes:**
  - [auth.routes.ts](file:///c:/Users/surya/OneDrive/Desktop/eventura-monorepo/eventura-api/src/modules/auth/auth.routes.ts) — annotated `/auth/login` and `/auth/me` endpoints.
  - [events.routes.ts](file:///c:/Users/surya/OneDrive/Desktop/eventura-monorepo/eventura-api/src/modules/events/events.routes.ts) — annotated `GET /events` endpoint.


# Mission 24 Audit — Open Mode + Dynamic Org Labels

This document tracks all changes made for Mission 24.

## 1. Reverted Mission 21 Strings
Reverted the generic "Organisation/Team" language back to "College/Club" to keep College Mode identical to its original state. The `useOrgLabels` hook now provides dynamic labels for non-university organisations.
- `app/(organiser)/org/settings/page.tsx`
- `app/(organiser)/org/members/page.tsx`
- `app/(attendee)/profile/page.tsx`
- `app/(admin)/admin/dashboard/page.tsx`
- `app/(admin)/admin/health/page.tsx`

## 2. Schema Migrations
- Added `AccountMode` enum (`COLLEGE`, `OPEN`).
- Added `accountMode` and `orgCategory` fields to `User` model.
- Added `orgCategory` field to `College` model.
- Made `Event.collegeId` optional (`String?`).
- Added `createdById` to `Event` and `createdEvents` relation to `User`.
- Created and ran two migrations: `add_account_mode_and_org_category` and `add_event_created_by`.

## 3. Backend Auth Service Updates
- `auth.types.ts`: Added `OrgLabels` interface and extended `JwtPayload` activeContext with `orgType`, `accountMode`, and `labels`. Added `orgCategory` to `SignupDto`.
- `auth.validation.ts`: Added `orgCategory` to `signupSchema`.
- `auth.service.ts`: 
  - Implemented `getOrgLabels(orgCategory)` to map categories to UI labels.
  - Updated `generateTokenPair` to include new activeContext fields in JWT.
  - Updated `signup` to set `accountMode` based on `orgCategory` (defaults to OPEN if not UNIVERSITY). Handles Open Mode instant approval without a college/club.
  - Updated `login`, `refreshToken`, and `contextSwitch` to resolve and inject dynamic labels into the session context.

## 4. Backend Events Service Updates
- `events.service.ts`:
  - Updated `createEvent` to handle Open Mode (no `collegeId`, instant publish, always public).
  - Updated `visibilityWhere` to include Open Mode events (where `collegeId` is null).
- `events.routes.ts`:
  - Added `POST /open` route for Open Mode event creation.
  - Added `GET /my-open-events` route for Creator dashboard.

## 5. Frontend Store & Hooks
- `authStore.ts`: Updated `AuthState` and `ActiveContext` to persist `orgType`, `accountMode`, and `labels`.
- `useOrgLabels.ts`: Created new hook to access dynamic org labels (falls back to DEFAULT_LABELS for college mode). Added helper hooks `useOrgType`, `useAccountMode`, `useIsOpenMode`.

## 6. Frontend Routing & Auth
- `middleware.ts`: Implemented mode-based routing using `eventura-mode` cookie to prevent cross-mode access (Open Mode users redirected to `/creator`, College Mode users to `/org`).
- `auth.api.ts`: Added `orgCategory` to `SignupDto`.
- `login/page.tsx`: Set `eventura-mode` cookie upon login and redirected Open Mode users to `/creator/dashboard`.
- `AuthInitializer.tsx`: Persisted `eventura-mode` cookie during silent refresh to ensure middleware routing works after page reloads.

## 7. Frontend Signup Flow
- `signup/page.tsx`: 
  - Included `orgCategory` in signup API payload.
  - Modified UI to instantly skip role selection (Step 2) for Open Mode users (non-UNIVERSITY).
  - Rendered a simplified signup form for Open Mode (Step 3 bypasses college/club fields).

## 8. Frontend Open Mode Pages (Creator)
- `app/(creator)/layout.tsx`: Created empty layout.
- `app/(creator)/creator/dashboard/page.tsx`: Created Luma-style dark themed creator dashboard with event stats and listings.
- `app/(creator)/creator/events/create/page.tsx`: Created single-page event creator with Luma-inspired two-column layout (instant publish, no college logic).
