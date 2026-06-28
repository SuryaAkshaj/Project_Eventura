# Eventura — Technical Architecture & Project Guide

This document provides a comprehensive technical overview of **Eventura**, a full-stack, multi-tenant SaaS platform for college and enterprise event management. It details the platform's vision, system architecture, database design, key flows (including security, payment, and QR scan operations), file structures, and past milestones.

---

## 1. Project Overview & Vision

Eventura replaces the fragmented way colleges manage events — using Google Forms for registration, WhatsApp for updates, UPI screenshots for payment validation, and paper spreadsheets for attendance tracking — with a single, secure, enterprise-ready platform.

### Core Goals
- **Federated Multi-Tenancy**: Support multiple separate institutions (tenants) isolating student records, payments, and club roles, while allowing cross-college visibility controls.
- **Fraud-Proof Ticketing**: Rotating QR nonces with real-time browser-based validation to completely prevent replay attacks, ticket screenshots, and double-entry fraud.
- **Automated Payout Routing**: Direct split payments using Razorpay Route, routing ticket revenues directly to organizer bank accounts minus a configurable platform fee.
- **Verified Credentials**: Automatically generated PDF certificates with custom branding, unique validation hashes, and future-ready blockchain hashes.

---

## 2. Technical Stack

| Layer | Technology | Purpose / Rationale |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router) | React Server Components, client-side caching, search-engine optimization, and dynamic route loading. |
| **Styling** | Tailwind CSS v3 | Utility-first styling with a curated, harmonious dark/light color palette (HSL tailored colors). |
| **State Management**| Zustand + React Query | Clean separation between client state (theme, active context, user details) and server cache. |
| **Backend API** | Node.js + Express + TypeScript | Modular, type-safe API endpoints structured around domains (modules). |
| **ORM** | Prisma Client | Type-safe queries, transaction isolation, and schema migrations. |
| **Database** | PostgreSQL 16 | Relational database supporting strict UUID primary keys and decimal numbers for precise monetary math. |
| **Connection Pooling**| PgBouncer | Running in transaction mode on port `6432` to avoid database connection exhaustion. |
| **Caching & Memory** | Redis 7 | Powering sliding-window rate limiting, rotating check-in nonces, and JWT blacklisting. |
| **Payments** | Razorpay Route | Dynamic payment links and automatic route splits. |
| **PDF Generation** | Puppeteer | Headless Chrome execution to render pixel-perfect, branded student certificates. |
| **Email** | Resend | Triggering transaction receipts and password reset OTPs. |
| **Image Hosting** | Cloudinary | Storing event banners, organization avatars, and logos. |

---

## 3. Architecture & Multi-Tenancy

Eventura uses a **Shared Database + Tenant Context Isolation** approach.

```
                      +-----------------------------+
                      |     Next.js 14 Frontend     |
                      |         (Port 3000)         |
                      +--------------+--------------+
                                     |
                                     |  HTTP REST (Axios)
                                     v
                      +-----------------------------+
                      |     Express Backend API     |
                      |         (Port 4000)         |
                      +-------+--------------+------+
                              |              |
           JWT Context &      |              |  Redis Token /
           AsyncLocalStorage  |              |  Nonce Commands
                              v              v
                      +-------+------+ +-----+------+
                      |    Prisma    | |   Redis    |
                      |  $extends    | |  (Port 6379)|
                      +-------+------+ +------------+
                              |
                              | Connection Pool (Transaction Mode)
                              v
                      +-------+------+
                      |  PgBouncer   |
                      |  (Port 6432) |
                      +-------+------+
                              |
                              v
                      +-------+------+
                      |  PostgreSQL  |
                      |  (Port 5432) |
                      +--------------+
```

### AsyncLocalStorage Tenant Isolation
To avoid manual propagation of the tenant filter (`collegeId`) through every business logic function, the platform utilizes Node.js's native `AsyncLocalStorage`.

1. **Authentication Interception**: The `authMiddleware` verifies the incoming JWT.
2. **Context Setup**: The user's active tenant environment (their `collegeId`, `userId`, and `role`) is extracted from the JWT payload and stored inside a thread-safe `AsyncLocalStorage` store named `tenantStorage`.
3. **Prisma Query Middleware**: The Prisma client is extended using `$extends` query hooks. For every database query (except for platform-wide Super Admin requests), the middleware:
   - Reads the store from `tenantStorage`.
   - Intercepts requests targeting tenant-specific models (e.g., `Event`, `Club`, `RoleAssignment`, `Registration`).
   - Dynamically injects `collegeId: store.collegeId` into the `where` filter (for reads, updates, and deletes) or the `data` payload (for creations).
   - This ensures complete data isolation. If a user tries to query an ID belonging to another college, the query simply evaluates to `null` or empty.

---

## 4. Key Security & Functional Flows

### A. Rotating QR Check-in Flow

To prevent fraud (such as sharing ticket screenshots or reprinting QR codes), the platform implements a dual Redis + PostgreSQL check-in mechanism.

```
Attendee Wallet Page                 Scanner App                       API Backend
      |                                  |                                  |
      | 1. Request QR                    |                                  |
      +-------------------------------------------------------------------->|
      |                                  |                                  | 2. Generate signed token
      |                                  |                                  | 3. Set random nonce in Redis
      |                                  |                                  |    (60-second TTL)
      | 4. Return signed token + nonce   |                                  |
      |<--------------------------------------------------------------------+
      |                                  |                                  |
      | 5. Show rotating QR on screen    |                                  |
      |    (nonce refreshes every 60s)   |                                  |
      |.................................>|                                  |
      |                                  | 6. Scan QR Code                  |
      |                                  |    (Sends Token + Event ID)      |
      |                                  |--------------------------------->|
      |                                  |                                  | 7. Check Token in Redis
      |                                  |                                  | 8. Acquire SETNX lock key
      |                                  |                                  |    (Prevents concurrent scans)
      |                                  |                                  | 9. Run Prisma transaction to
      |                                  |                                  |    mark registration Checked-In
      |                                  |                                  | 10. Record ScanLog
      |                                  |                                  | 11. Delete Redis token + lock
      |                                  | 12. Return Success / Duplicate   |
      |                                  |<---------------------------------+
```

1. **Token Generation**: When an attendee views a ticket, the backend generates an HMAC-signed token.
2. **Rotating Nonces**: The backend creates a 60-second rotating nonce stored in Redis under `nonce:${registrationId}`. The frontend refreshes the QR code value dynamically.
3. **Fast Path Verification**: The Event Manager scans the QR. The API first searches for the token in Redis.
4. **SETNX Lock**: To prevent race conditions from duplicate, simultaneous scans, the backend runs `SETNX` on `checkin-lock:${qrToken}` with a 30-second TTL.
5. **Database Transaction**: The status update is performed within a database transaction to ensure idempodency.
6. **Logging & Expiry**: A log is generated in `ScanLog`, the Redis token is invalidated, and the lock is released.

### B. Multi-Tier Role System (RBAC)

Users can hold multiple roles across the platform. An attendee can be a Club President in one college or an Event Manager in another.

- **Super Admin**: Bypasses row-level tenant filters. Manages platform parameters, approves colleges/clubs, and views global logs.
- **College Admin**: Manages settings, clubs, members, and event approvals for a specific college.
- **Club President**: Drafts and manages events, monitors registration revenue, and views club member lists.
- **Event Manager**: Temporarily designated staff per event. Granted permission to operate the QR scanner.
- **Attendee**: Browses public/federated events, registers, processes ticket payments, and downloads certificates.

Dynamic role-switching is supported. When switching context, a request is sent to `/api/v1/auth/context-switch` and a new JWT is issued containing the target context.

### C. Pre-Flight Readiness Checklist

Organizers cannot publish an event until it achieves a **Readiness Score** of 60/100.

| Criteria | Score Impact | Validation Rule |
| :--- | :---: | :--- |
| **Title** | +10 | Must exist |
| **Description** | +10 | Must exist |
| **Banner** | +10 | Image URL uploaded |
| **Dates** | +15 | Valid Start/End dates |
| **Location** | +15 | Venue name or Online Link present |
| **Max Capacity**| +10 | Non-zero capacity limit |
| **Payment Setup**| +15 | Free = automatic. Paid = linked Razorpay account verified |
| **Sessions** | +10 | Must have at least 1 session (or sub-event for Fests) |
| **Deadlines** | +5 | Separate registration deadline set |
| **Rules** | +5 | Competition rules specified (if category is Competition) |

---

## 5. Directory Structure

```
eventura-monorepo/
├── eventura/                         # NEXT.JS FRONTEND
│   ├── app/                          # App Router Pages
│   │   ├── (public)/                 # Landing page, login, signup, terms, privacy
│   │   ├── (attendee)/               # Attendee dashboard, tickets, certificates, profile
│   │   ├── (organiser)/              # Organiser dashboard, settings, event wizard
│   │   └── (admin)/                  # Super Admin analytics, college approvals, setting controls
│   ├── components/                   # UI Elements
│   │   ├── auth/                     # Signup & login components
│   │   ├── layout/                   # Role-specific navbars (Attendee, Org, Admin)
│   │   └── ui/                       # Atomic components (button, card, dialog, shimmers)
│   ├── lib/                          # Libraries
│   │   ├── api/                      # Client-side api services (Axios interceptors)
│   │   ├── store/                    # Zustand authentication and session store
│   │   ├── context/                  # React Context providers
│   │   └── providers/                # React Query wrap
│   └── middleware.ts                 # Next.js route protection middleware
│
├── eventura-api/                     # EXPRESS BACKEND
│   ├── src/
│   │   ├── config/                   # Config Files
│   │   │   ├── database.ts           # Dual Prisma clients (tenant-aware + raw)
│   │   │   ├── redis.ts              # Redis client configurations & blacklist functions
│   │   │   └── env.ts                # Zod environment variable check
│   │   ├── middleware/               # Middlewares
│   │   │   ├── auth.middleware.ts    # JWT parsing, blacklists, role expiries
│   │   │   ├── tenant.middleware.ts  # SQL RLS settings
│   │   │   ├── rbac.middleware.ts    # Role/permission enforcement logic
│   │   │   ├── rateLimiter.middleware.ts # Sliding window limits via Redis
│   │   │   └── errorHandler.middleware.ts # Global express error management
│   │   ├── modules/                  # Modular Subsystems
│   │   │   ├── auth/                 # Authentication, context-switches, password recoveries
│   │   │   ├── events/               # Event CRUD, readiness scores, fests/competitions
│   │   │   ├── registrations/        # Ticket registration queues, cancellations, waitlists
│   │   │   ├── qr/                   # Nonces, scanned locks, database check-ins
│   │   │   ├── payments/             # Webhooks, payment validation, payouts
│   │   │   ├── certificates/         # Puppeteer-based PDF rendering
│   │   │   └── admin/                # Global statistics & audits
│   └── prisma/                       # Database schema definition
│       ├── schema.prisma             # Core prisma database schema
│       └── seed.ts                   # Seed script containing fake mock environments
```

---

## 6. Database Models

The schema uses 15 tables across 3 scope boundaries:

### Global Scope (No Tenant Filtering)
1. **User**: User credentials, verification states, avatar, and Google OAuth associations.
2. **College**: Registered tenant details (logo, domain name, states, cities, approval states).
3. **Role**: Static enum bindings mapping permissions.
4. **Permission**: Specific string targets (`events:write`, `scanner:use`, etc.).
5. **PlatformSettings**: Singleton table regulating platform-wide transaction fees and maintenance flags.

### Tenant Scope (collegeId injected)
6. **Club**: Student clubs belonging to colleges (requires approval from College Admins).
7. **RoleAssignment**: Scoped user-role combinations, identifying expiration parameters (for temporary Event Managers) or club affiliations.
8. **Event**: Event templates specifying types (Fests, Competitions, Workshops) and categories.
9. **EventSession**: Agenda intervals mapping schedules.
10. **SharedEvent**: Pivot tables allowing events created by College A to be visible to students in College B.

### Transactional Scope (Implicit relation scoping)
11. **Registration**: Ticket bookings mapping users to events, statuses (registered, waitlisted, checked-in).
12. **Payment**: Payment ledger verifying Razorpay order IDs, platform splits, and settlement timestamps.
13. **RazorpayAccount**: Links colleges to their verified Razorpay seller IDs.
14. **ScanLog**: Audit ledger tracking when tickets were scanned, by which manager, and the result.
15. **Waitlist**: Positional registration overflow queue.
16. **Certificate**: Stores generated PDF paths and verification keys.
17. **EventFeedback**: Five-star rating records.
18. **AuditLog**: Platform audits reflecting sensitive configurations or mutations.

---

## 7. Past Milestones & Fixes (Up to Mission 20)

### Major Milestones
- **Multi-Tenant isolation**: Implementation of extended Prisma query scopes driven by Express JWT parsing.
- **Razorpay Routing**: Automated splitting of payouts direct to vendor college accounts.
- **Puppeteer Worker**: Offloading PDF generation tasks (certificates) using high-fidelity rendering.
- **Replay Protection**: Implementation of 60-second Redis rotating nonces for check-in QR codes.

### Mission 20 Improvements & Fixes
- **Category Filter Fix**: The category search query parameter (`category=Technical`) was changed from an exact match to a case-insensitive containment lookup (`contains` filter) to accommodate variable labels like "Technical" vs "Technology".
- **API Endpoint Corrections**: Replaced broken frontend API calls targetting `/org/members` and `/org/settings` (which were client routing directories) with the correct backend paths: `/colleges/my-members` and `/colleges/my-org` respectively.
- **Database Cleanup**: Removed duplicate events introduced during seeding tests, preserving the most recent record per title.
- **Wizard Step Validation**: Intercepts form advancement inside the Event Wizard, validation checks dates, capacity, location details, and flags missing fields inline before users can advance.
- **Audio Feedback**: Utilizes Web Audio API to synthesise acoustic signals on the QR check-in page (Success = high double chime, Duplicate = double low buzzer, Error/Payment Pending = single low sawtooth drone).
- **Shimmer Loaders**: Replaced raw skeleton screens on Browse Events, My Tickets, and User Directory panels with smooth, pulsating SVG shimmer components.
- **Flexible Empty States**: Added conditional alerts to the Events browse page to help guide guest accounts, filter setups, and general zero-results states.
- **Enhanced Profile**: Polished user profiles with gradients, initials placeholders, status indicators, and password change redirects.
