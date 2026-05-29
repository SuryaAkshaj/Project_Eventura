# EVENTURA — ANTIGRAVITY MISSION 3
## Auth: Signup, Login, Email Verification, Role Selection, Pending Approval

---

## CRITICAL RULES — READ BEFORE TOUCHING ANY FILE

1. **DO NOT modify any existing UI** — colors, layouts, fonts, spacing, component structure. The frontend is pixel-perfect. Only wire functionality into existing elements.
2. **DO NOT install new packages** without explicitly being told to in this prompt.
3. **DO NOT run `prisma migrate`** — the database schema is already migrated.
4. **DO NOT modify `prisma/schema.prisma`** — it is complete.
5. **DO NOT modify `docker-compose.yml`** — infrastructure is already set up.
6. **Only touch the files explicitly listed in each section below.**

---

## PROJECT CONTEXT

This is an existing full-stack monorepo:

```
eventura-monorepo/
├── eventura/              ← Next.js 14, App Router, TypeScript, Tailwind CSS v3
│   ├── app/
│   │   ├── (public)/      ← Landing, Login, Signup, Pending Approval pages
│   │   ├── (attendee)/    ← Dashboard, Events, Tickets, Certificates
│   │   ├── (organiser)/   ← Org dashboard, event management
│   │   └── (admin)/       ← Super admin pages
│   ├── components/
│   │   └── layout/        ← AttendeeNavbar, OrgSidebar, AdminSidebar
│   ├── lib/mockData.ts    ← Mock data (DO NOT DELETE)
│   └── middleware.ts      ← Placeholder auth middleware
├── eventura-api/          ← Node.js, Express, TypeScript, Prisma, PostgreSQL, Redis
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts   ← Multi-tenant Prisma client (AsyncLocalStorage + $extends)
│   │   │   ├── redis.ts      ← Redis client with setWithExpiry, getAndDelete, setNX helpers
│   │   │   └── env.ts        ← Zod environment validation
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── rbac.middleware.ts
│   │   │   ├── tenant.middleware.ts
│   │   │   ├── rateLimiter.middleware.ts
│   │   │   ├── errorHandler.middleware.ts
│   │   │   └── requestLogger.middleware.ts
│   │   ├── shared/
│   │   │   ├── utils/apiResponse.ts     ← { success, data, message } wrapper
│   │   │   ├── utils/asyncHandler.ts
│   │   │   ├── utils/logger.ts
│   │   │   └── constants/permissions.ts
│   │   ├── modules/
│   │   │   ├── health/health.routes.ts  ← Already implemented
│   │   │   └── auth/                   ← EMPTY — implement in this mission
│   │   └── app.ts
│   └── prisma/
│       └── schema.prisma               ← Complete, do not modify
```

---

## PACKAGES TO INSTALL

### Backend (`eventura-api/`):
```bash
npm install bcryptjs jsonwebtoken cookie-parser nodemailer
npm install -D @types/bcryptjs @types/jsonwebtoken @types/cookie-parser @types/nodemailer
```

### Frontend (`eventura/`):
```bash
npm install axios js-cookie zustand
npm install -D @types/js-cookie
```

---

## PART 1 — BACKEND: AUTH MODULE

Create all files inside `eventura-api/src/modules/auth/`.

---

### `auth.types.ts`

```typescript
export interface SignupDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  requestedRole: 'ATTENDEE' | 'COLLEGE_ADMIN' | 'CLUB_PRESIDENT';
  collegeName?: string;      // Required if COLLEGE_ADMIN
  collegeDomain?: string;    // Required if COLLEGE_ADMIN
  clubName?: string;         // Required if CLUB_PRESIDENT
  collegeId?: string;        // Required if CLUB_PRESIDENT
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface JwtPayload {
  sub: string;               // userId
  email: string;
  activeContext: {
    role: string;
    collegeId: string | null;
    clubId: string | null;
    permissions: string[];
  };
  iss: string;
  iat: number;
  exp: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
```

---

### `auth.service.ts`

Implement these functions:

#### `generateTokenPair(user, activeContext): TokenPair`
- Generate access token (JWT, 15m expiry) with payload:
  ```json
  {
    "sub": "userId",
    "email": "user@email.com",
    "activeContext": {
      "role": "ATTENDEE",
      "collegeId": "uuid or null",
      "clubId": "uuid or null",
      "permissions": ["events:read"]
    },
    "iss": "eventura-auth"
  }
  ```
- Generate refresh token (JWT, 7d expiry) with only `{ sub: userId }`
- Store refresh token in Redis: `SET refresh:<userId> <token> EX 604800`
- Return `{ accessToken, refreshToken }`

#### `signup(dto: SignupDto): Promise<{ user, message }>`
- Validate email is not already registered
- Hash password with bcrypt (rounds: 12)
- Create `User` record
- If `requestedRole === 'ATTENDEE'`:
  - Find college by email domain automatically
  - Create `RoleAssignment` with `status: APPROVED` immediately
- If `requestedRole === 'COLLEGE_ADMIN'`:
  - Create `College` record with `approvalStatus: PENDING`
  - Create `RoleAssignment` with `status: PENDING`
- If `requestedRole === 'CLUB_PRESIDENT'`:
  - Verify `collegeId` exists and is APPROVED
  - Create `Club` record with `approvalStatus: PENDING`
  - Create `RoleAssignment` with `status: PENDING`
- Generate 6-digit OTP
- **DO NOT send email** — log OTP to console with this exact format:
  ```
  [EVENTURA AUTH] OTP for user@email.com: 123456 (expires in 10 minutes)
  ```
- Store OTP in Redis: `SET otp:<userId> <otp> EX 600`
- Return `{ user: { id, email, firstName }, message: 'Verification OTP sent to console (dev mode)' }`

#### `verifyEmail(userId, otp): Promise<void>`
- Get OTP from Redis: `GET otp:<userId>`
- If null → throw 'OTP expired or invalid'
- If mismatch → throw 'Invalid OTP'
- Update `User.isEmailVerified = true`
- Delete OTP from Redis
- If user's `RoleAssignment.status === 'APPROVED'` → also mark `isIdentityVerified = true`

#### `login(dto: LoginDto): Promise<{ tokenPair, user, approvalStatus }>`
- Find user by email, throw 401 if not found
- Compare password with bcrypt
- Check `isEmailVerified` → throw 403 with `{ code: 'EMAIL_NOT_VERIFIED' }` if false
- Get all APPROVED `RoleAssignments` for user
- Determine `activeContext`:
  - If user has exactly one APPROVED role → use it automatically
  - If user has multiple APPROVED roles → return `{ requiresContextSelection: true, roles: [...] }` with 206 status — frontend will show role switcher
  - If user has zero APPROVED roles → check if any are PENDING → return `{ requiresApproval: true }` with 202 status
- Generate token pair with determined activeContext
- Update `User.lastLoginAt`
- Set refresh token as HTTP-only cookie
- Return token pair + user info + approvalStatus

#### `refreshToken(refreshToken: string): Promise<TokenPair>`
- Verify refresh token JWT
- Check Redis for stored refresh token → throw 401 if blacklisted or missing
- Get user with their active role assignments
- Generate new token pair (rotate refresh token — delete old, store new)
- Return new token pair

#### `logout(userId, accessToken): Promise<void>`
- Add access token to Redis blacklist: `SET blacklist:<token> true EX <remaining TTL>`
- Delete refresh token from Redis: `DEL refresh:<userId>`
- Clear HTTP-only cookie

#### `getApprovalStatus(userId): Promise<object>`
- Return:
  ```json
  {
    "emailVerified": true,
    "identityVerified": false,
    "superAdminApproval": "PENDING",
    "role": "COLLEGE_ADMIN"
  }
  ```
- `superAdminApproval` comes from `RoleAssignment.status`

#### `contextSwitch(userId, roleId, collegeId, clubId): Promise<TokenPair>`
- Verify user owns this `RoleAssignment` and it is `APPROVED`
- Verify `RoleAssignment.expiresAt` is null or in the future
- Build new `activeContext` from the role assignment
- Generate and return new token pair

#### `forgotPassword(email): Promise<void>`
- Find user by email (silently succeed even if not found — prevent email enumeration)
- Generate 6-digit OTP
- Store in Redis: `SET reset:<userId> <otp> EX 900`
- Log to console: `[EVENTURA AUTH] Password reset OTP for user@email.com: 123456`

#### `resetPassword(userId, otp, newPassword): Promise<void>`
- Verify OTP from Redis
- Hash new password
- Update `User.passwordHash`
- Delete OTP from Redis
- Invalidate all existing refresh tokens: `DEL refresh:<userId>`

---

### `auth.controller.ts`

Wrap all service calls with `asyncHandler`. Use `apiResponse` utility for all responses.

```typescript
POST   /auth/signup              → authService.signup()
POST   /auth/verify-email        → authService.verifyEmail()
POST   /auth/login               → authService.login()
POST   /auth/refresh             → authService.refreshToken()
POST   /auth/logout              → authService.logout()
GET    /auth/status              → authService.getApprovalStatus()
POST   /auth/context-switch      → authService.contextSwitch()
POST   /auth/forgot-password     → authService.forgotPassword()
POST   /auth/reset-password      → authService.resetPassword()
```

For login, set refresh token as HTTP-only cookie:
```typescript
res.cookie('eventura_refresh', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
  path: '/',
});
```

---

### `auth.validation.ts`

Use **Zod** for input validation on all endpoints. Throw 400 with field-level errors if validation fails.

```typescript
signupSchema: email, password (min 8 chars, 1 uppercase, 1 number), firstName, lastName, requestedRole
loginSchema: email, password
verifyEmailSchema: userId, otp (6 digits)
forgotPasswordSchema: email
resetPasswordSchema: userId, otp, newPassword
contextSwitchSchema: roleId, collegeId, clubId (optional)
```

---

### `auth.routes.ts`

```typescript
import { Router } from 'express';
import { rateLimiter } from '@middleware/rateLimiter.middleware';
import * as authController from './auth.controller';

const router = Router();

// Strict rate limiting on all auth routes (10 req/min per IP)
router.use(rateLimiter.auth);

router.post('/signup', authController.signup);
router.post('/verify-email', authController.verifyEmail);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/status', authController.getApprovalStatus);
router.post('/context-switch', authController.contextSwitch);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;
```

---

### Register auth routes in `src/app.ts`

Add this line after the health route — **only this addition, nothing else in app.ts**:

```typescript
import authRoutes from '@modules/auth/auth.routes';
app.use('/auth', authRoutes);
```

---

## PART 2 — FRONTEND: AUTH STORE

Create `eventura/lib/store/authStore.ts` using Zustand:

```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  activeRole: string | null;
  collegeId: string | null;
  clubId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user, accessToken, activeContext) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}
```

- Persist `accessToken` in memory only (NOT localStorage — security)
- On app load, attempt token refresh from HTTP-only cookie automatically

---

## PART 3 — FRONTEND: API CLIENT

Create `eventura/lib/api/client.ts`:

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  withCredentials: true,   // Required for HTTP-only refresh token cookie
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach access token from Zustand store
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — auto-refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        const { data } = await axios.post('/auth/refresh', {}, { withCredentials: true });
        useAuthStore.getState().setAuth(null, data.data.accessToken, null);
        error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return apiClient(error.config);
      } catch {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

Create `eventura/lib/api/auth.api.ts` with typed functions for every auth endpoint:
```typescript
export const authApi = {
  signup: (dto) => apiClient.post('/auth/signup', dto),
  verifyEmail: (userId, otp) => apiClient.post('/auth/verify-email', { userId, otp }),
  login: (dto) => apiClient.post('/auth/login', dto),
  logout: () => apiClient.post('/auth/logout'),
  getStatus: () => apiClient.get('/auth/status'),
  contextSwitch: (dto) => apiClient.post('/auth/context-switch', dto),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (dto) => apiClient.post('/auth/reset-password', dto),
};
```

---

## PART 4 — FRONTEND: WIRE AUTH PAGES

Wire real API calls into existing pages. **DO NOT change any className, layout, color, or component structure. Only add state management and API calls.**

---

### `eventura/app/(public)/login/page.tsx`

- Add `useState` for email, password, error, isLoading
- On form submit → call `authApi.login()`
- Handle responses:
  - `200` → store auth in Zustand → redirect based on role:
    - `ATTENDEE` → `/dashboard`
    - `COLLEGE_ADMIN` or `CLUB_PRESIDENT` → `/org/dashboard`
    - `SUPER_ADMIN` → `/admin/dashboard`
  - `202` → redirect to `/signup/pending-approval`
  - `206` → show role switcher modal (see below)
  - `403 EMAIL_NOT_VERIFIED` → redirect to `/signup/verify-email?userId=<id>`
  - Any other error → show error message inline below the form
- Google OAuth button → keep existing UI but add `title="Coming Soon"` and `disabled` attribute and `opacity-50 cursor-not-allowed` classes — DO NOT remove the button
- "Forgot Password?" link → redirect to `/forgot-password`
- "Sign up" link → redirect to `/signup`
- Show spinner inside the submit button while `isLoading` is true

---

### `eventura/app/(public)/signup/page.tsx` (Role Selection page)

This page currently shows role cards. Wire it as a two-step flow:

**Step 1 — Role Selection** (existing UI):
- Three cards: Attendee, Club President, College Admin
- On card click → store selected role in local state → show Step 2

**Step 2 — Registration Form** (add below existing cards, hidden until role selected):
- All roles: firstName, lastName, email, password, confirmPassword fields
- College Admin only: collegeName, collegeDomain (e.g. university.edu) fields
- Club President only: dropdown to select existing approved college + clubName fields
  - Populate college dropdown by calling `GET /colleges/approved` (create this endpoint in Part 5)
- On submit → call `authApi.signup()`
- On success → redirect to `/signup/verify-email?userId=<id>`
- Show inline validation errors from Zod (field level)

---

### Create `eventura/app/(public)/signup/verify-email/page.tsx`

New page — create from scratch but match the existing design system exactly:
- Use same colors, fonts, spacing as other public pages
- Show: "Check your console for your OTP (dev mode)" message
- 6-digit OTP input (individual digit boxes or single input)
- Submit button → call `authApi.verifyEmail(userId, otp)`
- On success:
  - If `ATTENDEE` → redirect to `/login` with success message
  - If `COLLEGE_ADMIN` or `CLUB_PRESIDENT` → redirect to `/signup/pending-approval`
- Resend OTP link → call `authApi.forgotPassword()` to regenerate

---

### `eventura/app/(public)/signup/pending-approval/page.tsx`

- On mount → call `authApi.getStatus()`
- Wire the three status bubbles (Email Verified, Identity Check, Super Admin Approval) to real data
- Poll every 30 seconds → update status automatically
- If `superAdminApproval === 'APPROVED'` → redirect to `/login` with success toast

---

### Create `eventura/app/(public)/forgot-password/page.tsx`

New page — match existing design system:
- Email input + submit button
- On submit → call `authApi.forgotPassword()`
- Show: "OTP sent to console (dev mode)"
- OTP input + new password + confirm password
- On submit → call `authApi.resetPassword()`
- On success → redirect to `/login`

---

### Create Role Switcher Modal Component

Create `eventura/components/auth/RoleSwitcherModal.tsx`:
- Shown when login returns 206 (multiple roles)
- Shows list of available roles as cards
- On role card click → call `authApi.contextSwitch()` → store new token → redirect
- Match existing card styling from the role_selection page exactly

---

## PART 5 — BACKEND: ONE ADDITIONAL ENDPOINT

Create `eventura-api/src/modules/colleges/colleges.routes.ts` with one public endpoint needed by the signup form:

```typescript
GET /colleges/approved
```

Returns list of all colleges with `approvalStatus: APPROVED`:
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "Woxsen University", "domain": "woxsen.edu.in" }
  ]
}
```

Register in `app.ts`:
```typescript
import collegeRoutes from '@modules/colleges/colleges.routes';
app.use('/colleges', collegeRoutes);
```

---

## PART 6 — FRONTEND: UPDATE MIDDLEWARE

Replace the placeholder in `eventura/middleware.ts` with real JWT validation:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ATTENDEE = ['/dashboard', '/events', '/certificates', '/my-tickets'];
const PROTECTED_ORGANISER = ['/org'];
const PROTECTED_ADMIN = ['/admin'];
const PUBLIC_ONLY = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('eventura-auth')?.value;
  const { pathname } = request.nextUrl;

  const isProtected = 
    PROTECTED_ATTENDEE.some(p => pathname.startsWith(p)) ||
    PROTECTED_ORGANISER.some(p => pathname.startsWith(p)) ||
    PROTECTED_ADMIN.some(p => pathname.startsWith(p));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (PUBLIC_ONLY.some(p => pathname.startsWith(p)) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## PART 7 — ENVIRONMENT VARIABLE

Add to `eventura/.env.local` (create if it doesn't exist):
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## VERIFICATION STEPS

Run these in order after completing everything. Do not stop until all pass:

1. `cd eventura-api && npx tsc --noEmit` → zero TypeScript errors
2. `npm run dev` → server starts, no errors
3. Test signup: `POST http://localhost:4000/auth/signup` with Attendee role → OTP appears in console
4. Test verify: `POST http://localhost:4000/auth/verify-email` with OTP → returns success
5. Test login: `POST http://localhost:4000/auth/login` → returns access token + sets cookie
6. Test refresh: `POST http://localhost:4000/auth/refresh` → returns new token pair
7. Test logout: `POST http://localhost:4000/auth/logout` → clears cookie
8. `cd eventura && npm run dev` → frontend starts on port 3000, no errors
9. Open `http://localhost:3000/login` → form submits, redirects correctly
10. Open `http://localhost:3000/signup` → role selection works, form submits, OTP page appears
11. Open `http://localhost:3000/dashboard` without login → redirects to `/login`

---

## FILES ALLOWED TO TOUCH — COMPLETE LIST

**Backend (create new):**
- `src/modules/auth/auth.types.ts`
- `src/modules/auth/auth.service.ts`
- `src/modules/auth/auth.controller.ts`
- `src/modules/auth/auth.validation.ts`
- `src/modules/auth/auth.routes.ts`
- `src/modules/colleges/colleges.routes.ts`

**Backend (modify existing — minimal changes only):**
- `src/app.ts` — add two route registrations only

**Frontend (create new):**
- `lib/store/authStore.ts`
- `lib/api/client.ts`
- `lib/api/auth.api.ts`
- `app/(public)/signup/verify-email/page.tsx`
- `app/(public)/forgot-password/page.tsx`
- `components/auth/RoleSwitcherModal.tsx`

**Frontend (modify existing — wire API only, no style changes):**
- `app/(public)/login/page.tsx`
- `app/(public)/signup/page.tsx`
- `app/(public)/signup/pending-approval/page.tsx`
- `middleware.ts`
- `.env.local`

**Everything else → DO NOT TOUCH.**
