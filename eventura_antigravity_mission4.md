# EVENTURA — ANTIGRAVITY MISSION 4
## Wire Frontend Auth to Real Backend

---

## CRITICAL RULES — READ BEFORE TOUCHING ANY FILE

1. **DO NOT modify any className, color, layout, font, or spacing** — the UI is pixel-perfect from Stitch. Only add state, handlers, and API calls into existing elements.
2. **DO NOT install new packages** — axios, zustand, and js-cookie are already installed from Mission 3.
3. **DO NOT modify any backend files** — the backend is complete and working.
4. **DO NOT modify `prisma/schema.prisma`** or run any Prisma commands.
5. **DO NOT delete `lib/mockData.ts`** — other pages still use it.
6. **Only touch the files explicitly listed at the bottom of this prompt.**

---

## PROJECT CONTEXT

### What exists and is working:
- Backend running on `http://localhost:4000`
- All auth endpoints tested and confirmed working:
  - `POST /auth/signup` ✅
  - `POST /auth/verify-email` ✅
  - `POST /auth/login` → returns `{ accessToken, user, activeContext }` ✅
  - `POST /auth/logout` ✅
  - `POST /auth/refresh` ✅
  - `GET /auth/status` ✅
  - `POST /auth/context-switch` ✅
  - `POST /auth/forgot-password` ✅
  - `POST /auth/reset-password` ✅
  - `GET /colleges/approved` ✅

### What exists in the frontend:
- `eventura/lib/store/authStore.ts` — Zustand store (already created in Mission 3)
- `eventura/lib/api/client.ts` — Axios client with interceptors (already created)
- `eventura/lib/api/auth.api.ts` — Typed auth API functions (already created)
- `eventura/app/(public)/login/page.tsx` — Login page UI exists, needs wiring
- `eventura/app/(public)/signup/page.tsx` — Role selection UI exists, needs wiring
- `eventura/app/(public)/signup/pending-approval/page.tsx` — Pending approval UI exists, needs wiring
- `eventura/app/(public)/signup/verify-email/page.tsx` — May or may not exist, create if missing
- `eventura/app/(public)/forgot-password/page.tsx` — May or may not exist, create if missing
- `eventura/components/auth/RoleSwitcherModal.tsx` — May or may not exist, create if missing
- `eventura/middleware.ts` — Placeholder middleware, needs real JWT check

### Login API response shape (confirmed working):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "test@woxsen.edu.in",
      "firstName": "Akshaj",
      "lastName": "Test",
      "avatarUrl": null
    },
    "accessToken": "eyJ...",
    "activeContext": {
      "role": "ATTENDEE",
      "collegeId": "uuid",
      "clubId": null
    }
  }
}
```

### Signup API response shape (confirmed working):
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "...", "firstName": "..." },
    "message": "Verification OTP sent to console (dev mode)"
  }
}
```

---

## PART 1 — VERIFY & FIX EXISTING FILES FROM MISSION 3

Before doing anything else, check if these files exist and are correct:

### Check `eventura/lib/store/authStore.ts`
Must export a Zustand store with:
```typescript
interface AuthState {
  user: { id: string; email: string; firstName: string; lastName: string; avatarUrl: string | null } | null;
  accessToken: string | null;
  activeRole: string | null;
  collegeId: string | null;
  clubId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: any, accessToken: string, activeContext: any) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}
```
- `setAuth` must set `user`, `accessToken`, `isAuthenticated: true`, and extract `activeRole`, `collegeId`, `clubId` from `activeContext`
- `clearAuth` must reset everything to null/false
- Store in memory only — NO localStorage

### Check `eventura/lib/api/client.ts`
Must have:
- `baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'`
- `withCredentials: true`
- Request interceptor attaching Bearer token from Zustand store
- Response interceptor auto-refreshing on 401 and redirecting to `/login` on refresh failure

### Check `eventura/lib/api/auth.api.ts`
Must export `authApi` object with all these functions:
```typescript
export const authApi = {
  signup: (dto) => apiClient.post('/auth/signup', dto),
  verifyEmail: (userId, otp) => apiClient.post('/auth/verify-email', { userId, otp }),
  login: (dto) => apiClient.post('/auth/login', dto),
  logout: () => apiClient.post('/auth/logout'),
  getStatus: (userId) => apiClient.get(`/auth/status?userId=${userId}`),
  contextSwitch: (dto) => apiClient.post('/auth/context-switch', dto),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (dto) => apiClient.post('/auth/reset-password', dto),
  getApprovedColleges: () => apiClient.get('/colleges/approved'),
};
```

If any of these files are missing or incomplete, create/fix them before proceeding.

---

## PART 2 — WIRE LOGIN PAGE

File: `eventura/app/(public)/login/page.tsx`

This is a `"use client"` page. Add the following functionality without changing any JSX structure or classNames:

### State to add:
```typescript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
const [availableRoles, setAvailableRoles] = useState([]);
const router = useRouter();
const { setAuth } = useAuthStore();
```

### Wire existing form inputs:
- Email input → `value={email} onChange={(e) => setEmail(e.target.value)}`
- Password input → `value={password} onChange={(e) => setPassword(e.target.value)}`
- Submit button → `onClick={handleLogin}` or form `onSubmit={handleLogin}`

### `handleLogin` function:
```typescript
const handleLogin = async (e) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);
  try {
    const response = await authApi.login({ email, password });
    const { data } = response.data;

    if (response.status === 206) {
      // Multiple roles — show role switcher
      setAvailableRoles(data.roles);
      setShowRoleSwitcher(true);
      return;
    }

    if (response.status === 202) {
      // Pending approval
      router.push('/signup/pending-approval');
      return;
    }

    // Success — store auth and redirect by role
    setAuth(data.user, data.accessToken, data.activeContext);
    
    // Set auth cookie for middleware
    document.cookie = `eventura-auth=${data.accessToken}; path=/; max-age=${15 * 60}`;

    const role = data.activeContext.role;
    if (role === 'SUPER_ADMIN') router.push('/admin/dashboard');
    else if (role === 'COLLEGE_ADMIN' || role === 'CLUB_PRESIDENT') router.push('/org/dashboard');
    else router.push('/dashboard');

  } catch (err: any) {
    const code = err.response?.data?.error?.code;
    const message = err.response?.data?.error?.message;
    
    if (code === 'EMAIL_NOT_VERIFIED') {
      const userId = err.response?.data?.error?.details?.userId;
      router.push(`/signup/verify-email?userId=${userId}`);
      return;
    }
    setError(message || 'Invalid email or password');
  } finally {
    setIsLoading(false);
  }
};
```

### Show error message:
Find where to display the error — add it just above the submit button in the existing JSX:
```tsx
{error && (
  <p className="text-sm text-red-500 text-center">{error}</p>
)}
```

### Submit button loading state:
Add `disabled={isLoading}` and show spinner text while loading:
- When `isLoading` is true: button shows "Signing in..."
- When false: button shows original text "Sign In" or whatever it currently says

### Google OAuth button:
Add `disabled title="Coming Soon"` and `className` addition of `opacity-50 cursor-not-allowed` — do not remove or restructure the button.

### "Sign up" link:
Wire to `href="/signup"`

### "Forgot Password?" link:
Wire to `href="/forgot-password"`

### Role Switcher Modal:
Add at the bottom of the JSX (before closing tag):
```tsx
{showRoleSwitcher && (
  <RoleSwitcherModal
    roles={availableRoles}
    onSelect={handleRoleSelect}
    onClose={() => setShowRoleSwitcher(false)}
  />
)}
```

---

## PART 3 — WIRE SIGNUP PAGE

File: `eventura/app/(public)/signup/page.tsx`

This page shows role selection cards then a registration form. Add a two-step flow:

### State to add:
```typescript
const [selectedRole, setSelectedRole] = useState<'ATTENDEE' | 'COLLEGE_ADMIN' | 'CLUB_PRESIDENT' | null>(null);
const [step, setStep] = useState<'role' | 'form'>('role');
const [formData, setFormData] = useState({
  firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
  collegeName: '', collegeDomain: '', collegeId: '', clubName: ''
});
const [colleges, setColleges] = useState([]);
const [errors, setErrors] = useState<Record<string, string>>({});
const [isLoading, setIsLoading] = useState(false);
const router = useRouter();
```

### Step 1 — Role selection (existing cards):
- On role card click → `setSelectedRole(role)` → `setStep('form')`
- If `CLUB_PRESIDENT` selected → also fetch colleges: `authApi.getApprovedColleges()`

### Step 2 — Registration form:
Show below or instead of role cards when `step === 'form'`. Add these fields using existing input styling from the page:
- All roles: First Name, Last Name, Email, Password, Confirm Password
- `COLLEGE_ADMIN` only: College Name, College Domain (placeholder: `university.edu`)
- `CLUB_PRESIDENT` only: Select College (dropdown from fetched colleges), Club Name
- Back button → `setStep('role')`

### Form validation (client-side before API call):
```typescript
const validate = () => {
  const newErrors: Record<string, string> = {};
  if (!formData.firstName) newErrors.firstName = 'First name is required';
  if (!formData.lastName) newErrors.lastName = 'Last name is required';
  if (!formData.email) newErrors.email = 'Email is required';
  if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
  if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
  if (selectedRole === 'COLLEGE_ADMIN' && !formData.collegeName) newErrors.collegeName = 'College name is required';
  if (selectedRole === 'COLLEGE_ADMIN' && !formData.collegeDomain) newErrors.collegeDomain = 'College domain is required';
  if (selectedRole === 'CLUB_PRESIDENT' && !formData.collegeId) newErrors.collegeId = 'Please select your college';
  if (selectedRole === 'CLUB_PRESIDENT' && !formData.clubName) newErrors.clubName = 'Club name is required';
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### `handleSignup` function:
```typescript
const handleSignup = async (e) => {
  e.preventDefault();
  if (!validate()) return;
  setIsLoading(true);
  try {
    const dto = {
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      requestedRole: selectedRole,
      ...(selectedRole === 'COLLEGE_ADMIN' && {
        collegeName: formData.collegeName,
        collegeDomain: formData.collegeDomain,
      }),
      ...(selectedRole === 'CLUB_PRESIDENT' && {
        collegeId: formData.collegeId,
        clubName: formData.clubName,
      }),
    };
    const response = await authApi.signup(dto);
    const userId = response.data.data.user.id;
    router.push(`/signup/verify-email?userId=${userId}`);
  } catch (err: any) {
    const message = err.response?.data?.error?.message;
    setErrors({ form: message || 'Signup failed. Please try again.' });
  } finally {
    setIsLoading(false);
  }
};
```

### Show field-level errors:
Below each input add:
```tsx
{errors.fieldName && <p className="text-xs text-red-500 mt-1">{errors.fieldName}</p>}
```

### "Sign in" link:
Wire to `href="/login"`

---

## PART 4 — CREATE VERIFY EMAIL PAGE

File: `eventura/app/(public)/signup/verify-email/page.tsx`

Create this page if it doesn't exist. Match the exact design system of other public pages:
- Deep Indigo primary color (`#2E3192`)
- Same font, spacing, card style as login page
- Mobile-first responsive

```tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api/auth.api';

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!userId) { setError('Invalid verification link'); return; }
    setIsLoading(true);
    setError('');
    try {
      await authApi.verifyEmail(userId, otp);
      setSuccess('Email verified successfully!');
      setTimeout(() => router.push('/login?verified=true'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid or expired OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // UI: centered card with Eventura branding
  // Title: "Verify Your Email"
  // Subtitle: "Check your console for your OTP (dev mode) — in production this arrives by email"
  // OTP input: single text input, maxLength=6, numeric keyboard
  // Submit button: "Verify Email" with loading state
  // Error/success messages inline
  // Link: "Back to login" → /login
}
```

---

## PART 5 — WIRE PENDING APPROVAL PAGE

File: `eventura/app/(public)/signup/pending-approval/page.tsx`

### Add real status polling:
```typescript
const [status, setStatus] = useState({
  emailVerified: false,
  identityVerified: false,
  superAdminApproval: 'PENDING'
});
const searchParams = useSearchParams();
const userId = searchParams.get('userId');

useEffect(() => {
  if (!userId) return;
  
  const fetchStatus = async () => {
    try {
      const response = await authApi.getStatus(userId);
      const data = response.data.data;
      setStatus(data);
      if (data.superAdminApproval === 'APPROVED') {
        router.push('/login?approved=true');
      }
    } catch (err) {
      console.error('Failed to fetch status', err);
    }
  };

  fetchStatus();
  const interval = setInterval(fetchStatus, 30000); // poll every 30s
  return () => clearInterval(interval);
}, [userId]);
```

### Wire the three status bubbles to real data:
- Email Verified bubble → `status.emailVerified`
- Identity Check bubble → `status.identityVerified`  
- Super Admin Approval bubble → `status.superAdminApproval === 'APPROVED'`

---

## PART 6 — CREATE FORGOT PASSWORD PAGE

File: `eventura/app/(public)/forgot-password/page.tsx`

Create if it doesn't exist. Two-step flow on the same page:

**Step 1 — Enter email:**
- Email input + Submit button
- On submit → `authApi.forgotPassword(email)`
- On success → show "OTP sent to console (dev mode)" + move to step 2

**Step 2 — Enter OTP + new password:**
- OTP input (6 digits)
- New password input
- Confirm password input
- On submit → `authApi.resetPassword({ userId, otp, newPassword })`
- On success → redirect to `/login?reset=true`

Note: The forgot password response needs to return `userId` — check if the backend returns it. If not, store the email and fetch userId from the response or pass it through query params.

---

## PART 7 — CREATE ROLE SWITCHER MODAL

File: `eventura/components/auth/RoleSwitcherModal.tsx`

Create if it doesn't exist:

```tsx
'use client';
interface Role {
  roleId: string;
  roleName: string;
  collegeId: string;
  clubId: string | null;
  collegeName: string;
  clubName: string | null;
}

interface Props {
  roles: Role[];
  onSelect: (role: Role) => void;
  onClose: () => void;
}

export default function RoleSwitcherModal({ roles, onSelect, onClose }: Props) {
  // Modal overlay with role cards
  // Each card shows: role name, college name, club name (if applicable)
  // On card click → onSelect(role)
  // Close button → onClose()
  // Use same card styling and colors as the role_selection page
  // Deep Indigo (#2E3192) for selected state
}
```

Add `handleRoleSelect` to login page:
```typescript
const handleRoleSelect = async (role) => {
  try {
    const response = await authApi.contextSwitch({
      roleId: role.roleId,
      collegeId: role.collegeId,
      clubId: role.clubId,
    });
    const { data } = response.data;
    setAuth(data.user, data.accessToken, data.activeContext);
    document.cookie = `eventura-auth=${data.accessToken}; path=/; max-age=${15 * 60}`;
    
    const roleName = data.activeContext.role;
    if (roleName === 'SUPER_ADMIN') router.push('/admin/dashboard');
    else if (roleName === 'COLLEGE_ADMIN' || roleName === 'CLUB_PRESIDENT') router.push('/org/dashboard');
    else router.push('/dashboard');
  } catch (err) {
    setError('Failed to switch role. Please try again.');
  }
  setShowRoleSwitcher(false);
};
```

---

## PART 8 — UPDATE NEXT.JS MIDDLEWARE

File: `eventura/middleware.ts`

Replace entirely with:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ATTENDEE = ['/dashboard', '/events', '/certificates', '/my-tickets'];
const PROTECTED_ORGANISER = ['/org'];
const PROTECTED_ADMIN = ['/admin'];
const PUBLIC_ONLY = ['/login', '/signup', '/forgot-password'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('eventura-auth')?.value;
  const { pathname } = request.nextUrl;

  const isProtectedAttendee = PROTECTED_ATTENDEE.some(p => pathname.startsWith(p));
  const isProtectedOrganiser = PROTECTED_ORGANISER.some(p => pathname.startsWith(p));
  const isProtectedAdmin = PROTECTED_ADMIN.some(p => pathname.startsWith(p));
  const isProtected = isProtectedAttendee || isProtectedOrganiser || isProtectedAdmin;
  const isPublicOnly = PUBLIC_ONLY.some(p => pathname.startsWith(p));

  // Redirect unauthenticated users to login
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from public-only pages
  if (isPublicOnly && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|signup/verify-email|signup/pending-approval).*)'],
};
```

---

## PART 9 — ADD SUCCESS TOAST ON LOGIN PAGE

For good UX, show success messages when redirected back to login after:
- Email verified (`?verified=true`)
- Account approved (`?approved=true`)
- Password reset (`?reset=true`)

Add to login page:
```typescript
const searchParams = useSearchParams();
const verified = searchParams.get('verified');
const approved = searchParams.get('approved');
const reset = searchParams.get('reset');

// Show banner if any of these are true
```

Add a dismissible banner above the form using existing color tokens.

---

## PART 10 — ADD ENV VARIABLE

Check if `eventura/.env.local` exists. If not create it:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## VERIFICATION STEPS

Run these after completing everything. Do not stop until all pass:

1. `cd eventura && npx tsc --noEmit` → zero TypeScript errors
2. `npm run dev` → frontend starts on port 3000 with no errors
3. Open `http://localhost:3000/login` → page loads correctly
4. Submit login form with `test@woxsen.edu.in` / `Test@1234` → redirects to `/dashboard`
5. Open `http://localhost:3000/dashboard` without login cookie → redirects to `/login`
6. Open `http://localhost:3000/signup` → role cards show, click Attendee → form appears
7. Fill signup form → submits → redirects to verify-email page
8. Enter OTP from backend console → redirects to `/login?verified=true`
9. Login page shows "Email verified" success banner
10. Open `http://localhost:3000/forgot-password` → form loads correctly

---

## FILES ALLOWED TO TOUCH — COMPLETE LIST

**Frontend (modify existing):**
- `app/(public)/login/page.tsx`
- `app/(public)/signup/page.tsx`
- `app/(public)/signup/pending-approval/page.tsx`
- `middleware.ts`
- `lib/api/auth.api.ts` — fix if incomplete
- `lib/store/authStore.ts` — fix if incomplete
- `lib/api/client.ts` — fix if incomplete

**Frontend (create new if missing):**
- `app/(public)/signup/verify-email/page.tsx`
- `app/(public)/forgot-password/page.tsx`
- `components/auth/RoleSwitcherModal.tsx`
- `.env.local`

**Everything else → DO NOT TOUCH.**
