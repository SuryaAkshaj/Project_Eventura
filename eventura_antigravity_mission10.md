# EVENTURA — ANTIGRAVITY MISSION 10
## Security Hardening + Final Integration

---

## CRITICAL RULES

1. **DO NOT change any UI design** — colors, fonts, layouts, spacing are final.
2. **DO NOT modify `prisma/schema.prisma`** — schema is complete.
3. **DO NOT run `prisma migrate`** — already migrated.
4. **Only touch files explicitly listed at the bottom.**

---

## PROJECT CONTEXT

### What exists and is working:
- Full stack: Auth, Events, Registrations, QR, Payments, Admin, Certificates ✅
- Frontend: `http://localhost:3001`
- Backend: `http://localhost:4000`
- Test Attendee: `test@woxsen.edu.in` / `Test@1234`
- Super Admin: `admin@eventura.app` / `Admin@1234`

### Confirmed issues to fix:

**Backend bugs:**
1. `GET /events` returns empty array — events filter excludes past-dated seeded events
2. `POST /registrations` throws raw `Error: ALREADY_REGISTERED` instead of proper 409 response
3. Error handling in registrations.service.ts uses raw `throw new Error('CODE')` instead of structured errors

**Frontend bugs:**
4. Super Admin `/admin/events` → 404 (page doesn't exist)
5. No logout button in Admin sidebar
6. No logout button in Organiser sidebar
7. No profile page linked from any navbar
8. Icons/buttons with `href="#"` causing page scroll instead of navigation
9. View QR button on My Tickets not navigating to `/my-tickets/[id]`
10. Events page shows empty — no events visible to attendee

**Security gaps:**
11. No brute force protection on login (unlimited attempts)
12. No account lockout after failed attempts
13. Error responses expose internal stack traces
14. No input sanitization against XSS
15. Missing security headers audit
16. No request size limits on file uploads

---

## PART 1 — FIX EVENTS FILTER (BACKEND)

File: `src/modules/events/events.service.ts`

Find the `getEvents` function. The current filter excludes events with past dates. Fix it to show all PUBLISHED events regardless of date — the frontend will handle "upcoming" vs "past" display:

Find the `where` clause in `getEvents` and remove any date filter like:
```typescript
startDate: { gte: new Date() }  // REMOVE THIS LINE
```

The correct where clause for public events should only filter by status and visibility — NOT by date:
```typescript
const where: any = {
  status: 'PUBLISHED',
  OR: [
    { visibility: 'PUBLIC' },
    { visibility: 'ALL_PLATFORM' },
    ...(userContext.collegeId ? [
      { visibility: 'ONLY_MY_COLLEGE', collegeId: userContext.collegeId },
      {
        visibility: 'SELECTED_COLLEGES',
        sharedWith: { some: { collegeId: userContext.collegeId } }
      }
    ] : []),
  ]
};
```

Also apply search/category/format filters only if they are provided:
```typescript
if (query.search) {
  where.AND = [
    { OR: [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ]}
  ];
}
if (query.category) where.category = query.category;
if (query.format) where.format = query.format;
if (query.isFree !== undefined) where.isFree = query.isFree;
```

---

## PART 2 — FIX REGISTRATION ERROR HANDLING (BACKEND)

File: `src/modules/registrations/registrations.service.ts`

The service uses `throw new Error('CODE')` which gets caught as INTERNAL_ERROR. Replace ALL raw throws with structured error objects:

Find every instance of:
```typescript
throw new Error('ALREADY_REGISTERED');
throw new Error('EVENT_NOT_FOUND');
throw new Error('EVENT_NOT_PUBLISHED');
throw new Error('EVENT_NOT_ACCESSIBLE');
```

Replace with structured throws:
```typescript
// ALREADY_REGISTERED → return existing registration instead of throwing
const alreadyRegistered = await prismaAdmin.registration.findUnique({
  where: { userId_eventId: { userId, eventId: dto.eventId } }
});
if (alreadyRegistered && alreadyRegistered.status !== 'CANCELLED') {
  // Return existing registration silently — idempotent behavior
  return { ...alreadyRegistered, alreadyRegistered: true };
}

// EVENT_NOT_FOUND
if (!event) {
  const err: any = new Error('Event not found');
  err.code = 'EVENT_NOT_FOUND';
  err.status = 404;
  throw err;
}

// EVENT_NOT_PUBLISHED  
if (event.status !== 'PUBLISHED') {
  const err: any = new Error('Event is not available for registration');
  err.code = 'EVENT_NOT_PUBLISHED';
  err.status = 400;
  throw err;
}

// EVENT_NOT_ACCESSIBLE
if (!canAccess) {
  const err: any = new Error('You do not have access to this event');
  err.code = 'EVENT_NOT_ACCESSIBLE';
  err.status = 403;
  throw err;
}
```

Also update the controller to handle `alreadyRegistered` gracefully:
```typescript
// In registrations.controller.ts registerForEvent:
const result = await registrationsService.registerForEvent(...);

if (result.alreadyRegistered) {
  return res.status(200).json({
    success: true,
    data: result,
    message: 'Already registered for this event'
  });
}
```

---

## PART 3 — FIX GLOBAL ERROR HANDLER (BACKEND)

File: `src/middleware/errorHandler.middleware.ts`

The error handler is exposing stack traces in production. Fix it to:
1. Never expose stack traces in production
2. Handle structured errors correctly
3. Return consistent error format

```typescript
import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const isDev = process.env.NODE_ENV === 'development';

  // Structured error (thrown with .code and .status)
  if (err.code && err.status) {
    return res.status(err.status).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(isDev && { details: err.stack }),
      }
    });
  }

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: { code: 'DUPLICATE', message: 'A record with this value already exists' }
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Record not found' }
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid authentication token' }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: { code: 'TOKEN_EXPIRED', message: 'Authentication token has expired' }
    });
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.errors.map((e: any) => ({ field: e.path.join('.'), message: e.message }))
      }
    });
  }

  // Default — never expose internals in production
  console.error('[ERROR]', err);
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: isDev ? err.message : 'An unexpected error occurred',
      ...(isDev && { details: err.stack }),
    }
  });
}
```

---

## PART 4 — SECURITY: BRUTE FORCE PROTECTION (BACKEND)

File: `src/modules/auth/auth.service.ts`

Add login attempt tracking using Redis. Find the `login` function and add this at the start:

```typescript
// Brute force protection
const attemptKey = `login-attempts:${dto.email}`;
const lockKey = `login-locked:${dto.email}`;

// Check if account is locked
const isLocked = await redis.get(lockKey);
if (isLocked) {
  const ttl = await redis.ttl(lockKey);
  const err: any = new Error(`Too many failed attempts. Try again in ${Math.ceil(ttl / 60)} minutes.`);
  err.code = 'ACCOUNT_LOCKED';
  err.status = 429;
  throw err;
}
```

After a failed password check, add:
```typescript
// Increment failed attempts
const attempts = await redis.incr(attemptKey);
await redis.expire(attemptKey, 900); // 15 minute window

if (attempts >= 5) {
  // Lock account for 15 minutes after 5 failed attempts
  await redis.setex(lockKey, 900, '1');
  await redis.del(attemptKey);
  const err: any = new Error('Too many failed attempts. Account locked for 15 minutes.');
  err.code = 'ACCOUNT_LOCKED';
  err.status = 429;
  throw err;
}

const err: any = new Error(`Invalid email or password. ${5 - attempts} attempts remaining.`);
err.code = 'INVALID_CREDENTIALS';
err.status = 401;
throw err;
```

After a SUCCESSFUL login, clear the attempt counter:
```typescript
// Clear failed attempts on success
await redis.del(attemptKey);
await redis.del(lockKey);
```

---

## PART 5 — SECURITY: INPUT SANITIZATION (BACKEND)

Install sanitization package:
```bash
cd eventura-api && npm install xss
npm install -D @types/xss
```

Create `src/shared/utils/sanitize.ts`:

```typescript
import xss from 'xss';

// Sanitize a string against XSS
export function sanitizeString(input: string): string {
  return xss(input, {
    whiteList: {},        // No HTML tags allowed
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
  });
}

// Sanitize an object recursively
export function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, sanitizeObject(v)])
    );
  }
  return obj;
}
```

Add sanitization middleware to `src/app.ts` — add AFTER the json middleware:
```typescript
import { sanitizeObject } from '@shared/utils/sanitize';

// Sanitize all request bodies against XSS
app.use((req, res, next) => {
  if (req.body && req.path !== '/payments/webhook') {
    req.body = sanitizeObject(req.body);
  }
  next();
});
```

---

## PART 6 — SECURITY: ENHANCED SECURITY HEADERS (BACKEND)

File: `src/app.ts`

Find the existing `helmet()` call and replace with enhanced configuration:

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://checkout.razorpay.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'", "https://api.razorpay.com"],
      frameSrc: ["https://api.razorpay.com"],
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  }
}));
```

Also update CORS to be strict:
```typescript
import cors from 'cors';

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.CLIENT_URL!]
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-idempotency-key', 'x-razorpay-signature'],
}));
```

---

## PART 7 — FIX ADMIN SIDEBAR (FRONTEND)

File: `eventura/components/layout/AdminSidebar.tsx`

### Add logout functionality:
```typescript
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { authApi } from '@/lib/api/auth.api';

const router = useRouter();
const { clearAuth } = useAuthStore();

const handleLogout = async () => {
  try {
    await authApi.logout();
  } catch (err) {
    console.error('Logout error', err);
  } finally {
    clearAuth();
    document.cookie = 'eventura-auth=; path=/; max-age=0';
    router.push('/login');
  }
};
```

### Fix all `href="#"` links in sidebar:
Find every `href="#"` and replace with the correct route:
- Events link → `href="/admin/events"` (points to new page from Part 9)
- Users link → `href="/admin/users"`
- Settings link → `href="/admin/settings"`
- Audit log link → `href="/admin/audit"`
- Any other `href="#"` → remove or point to correct route

### Add logout button at bottom of sidebar:
```tsx
<button
  onClick={handleLogout}
  className="...match existing sidebar item styling..."
>
  Logout
</button>
```

### Add profile link:
```tsx
<Link href="/admin/profile" className="...match existing user avatar area...">
  {/* existing user avatar/name display */}
</Link>
```

---

## PART 8 — FIX ORGANISER SIDEBAR (FRONTEND)

File: `eventura/components/layout/OrgSidebar.tsx`

Same fixes as AdminSidebar:

### Add logout:
```typescript
const handleLogout = async () => {
  try { await authApi.logout(); } catch {}
  clearAuth();
  document.cookie = 'eventura-auth=; path=/; max-age=0';
  router.push('/login');
};
```

### Fix all `href="#"` links:
- Dashboard → `href="/org/dashboard"`
- Events → `href="/org/events"`
- Scanner → keep as is (needs eventId so leave disabled or remove)
- Payments → `href="/org/payments"`
- Members → `href="/org/members"`
- Settings → `href="/org/settings"`
- Any remaining `href="#"` → fix or remove

### Add logout button at bottom.

---

## PART 9 — FIX ATTENDEE NAVBAR (FRONTEND)

File: `eventura/components/layout/AttendeeNavbar.tsx`

### Add logout:
```typescript
const handleLogout = async () => {
  try { await authApi.logout(); } catch {}
  clearAuth();
  document.cookie = 'eventura-auth=; path=/; max-age=0';
  router.push('/login');
};
```

### Fix all `href="#"` links:
- Dashboard → `href="/dashboard"`
- Events → `href="/events"`
- My Tickets → `href="/my-tickets"`
- Certificates → `href="/certificates"`
- Profile → `href="/profile"` (placeholder page from Part 11)
- Logout → call `handleLogout()`

---

## PART 10 — FIX VIEW QR BUTTON (FRONTEND)

File: `eventura/app/(attendee)/my-tickets/page.tsx`

Find the "View QR" or "Full View" button and fix it to navigate correctly:

```tsx
// Find the button and replace href or onClick:
<button
  onClick={() => router.push(`/my-tickets/${registration.id}`)}
  className="...existing classes..."
>
  View QR
</button>
```

Or if it's a Link:
```tsx
<Link href={`/my-tickets/${registration.id}`}>
  View QR
</Link>
```

---

## PART 11 — CREATE MISSING PAGES (FRONTEND)

### Create `eventura/app/(admin)/admin/events/page.tsx`:
```tsx
'use client';
import { useState, useEffect } from 'react';
import { eventsApi } from '@/lib/api/events.api';
import Link from 'next/link';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Admin can see ALL events — use org events endpoint for now
    // In future this would be a dedicated admin/events endpoint
    eventsApi.getEvents({ limit: 50 })
      .then(res => setEvents(res.data.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    PUBLISHED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
    COMPLETED: 'bg-blue-100 text-blue-700',
  };

  return (
    // Use existing admin layout styling — Deep Indigo (#2E3192)
    // Page title: "All Events"
    // Table with: Event title, College, Status badge, Date, Registrations count
    // Loading skeleton while fetching
    // Empty state if no events
    // Search input to filter by title
    <div className="p-6">
      <h1 className="text-2xl font-bold text-indigo-900 mb-6">All Events</h1>
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-200 rounded" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No published events found.</p>
          <p className="text-sm mt-2">Events will appear here once organisers publish them.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Event</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">College</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Registrations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map(event => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{event.title}</td>
                  <td className="px-4 py-3 text-gray-600">{event.college?.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[event.status] || 'bg-gray-100'}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{event._count?.registrations || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

### Create `eventura/app/(admin)/admin/users/page.tsx`:
```tsx
'use client';
import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api/admin.api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = () => {
    adminApi.getAllUsers({ search: search || undefined })
      .then(res => setUsers(res.data.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [search]);

  return (
    // Use existing admin layout styling
    // Page title: "All Users"
    // Search input
    // Table: Name, Email, College, Role, Joined date, Last login
    // Loading skeleton
    <div className="p-6">
      <h1 className="text-2xl font-bold text-indigo-900 mb-6">All Users</h1>
      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-200 rounded" />)}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{user.firstName} {user.lastName}</td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {user.roleAssignments?.[0]?.role?.name || 'ATTENDEE'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

### Create `eventura/app/(admin)/admin/audit/page.tsx`:
```tsx
'use client';
import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api/admin.api';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminApi.getAuditLog({ limit: 100 })
      .then(res => setLogs(res.data.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const actionColors: Record<string, string> = {
    COLLEGE_APPROVED: 'bg-green-100 text-green-700',
    COLLEGE_REJECTED: 'bg-red-100 text-red-700',
    CLUB_APPROVED: 'bg-green-100 text-green-700',
    EVENT_PUBLISHED: 'bg-blue-100 text-blue-700',
    EVENT_CANCELLED: 'bg-red-100 text-red-700',
    CERTIFICATE_GENERATED: 'bg-purple-100 text-purple-700',
    PLATFORM_SETTINGS_UPDATED: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-indigo-900 mb-6">Audit Log</h1>
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(10)].map((_, i) => <div key={i} className="h-10 bg-gray-200 rounded" />)}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Details</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${actionColors[log.action] || 'bg-gray-100 text-gray-700'}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">
                    {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {JSON.stringify(log.details || {})}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">
                    {new Date(log.createdAt).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

### Create placeholder profile pages:

`eventura/app/(attendee)/profile/page.tsx`:
```tsx
'use client';
import { useAuthStore } from '@/lib/store/authStore';

export default function ProfilePage() {
  const { user, activeRole } = useAuthStore();
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-indigo-900 mb-6">My Profile</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">Name</label>
          <p className="text-gray-900 font-medium">{user?.firstName} {user?.lastName}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
          <p className="text-gray-900">{user?.email}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">Role</label>
          <p className="text-gray-900">{activeRole}</p>
        </div>
      </div>
    </div>
  );
}
```

---

## PART 12 — FIX ORG MEMBERS AND SETTINGS PLACEHOLDER PAGES

Create `eventura/app/(organiser)/org/members/page.tsx`:
```tsx
'use client';
export default function OrgMembersPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-indigo-900 mb-2">Club Members</h1>
      <p className="text-gray-500">Member management coming soon. Use the event scanner to appoint Event Managers per event.</p>
    </div>
  );
}
```

Create `eventura/app/(organiser)/org/settings/page.tsx`:
```tsx
'use client';
import { useAuthStore } from '@/lib/store/authStore';
export default function OrgSettingsPage() {
  const { user } = useAuthStore();
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-indigo-900 mb-6">Organisation Settings</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">Account</label>
          <p className="text-gray-900 font-medium">{user?.firstName} {user?.lastName}</p>
          <p className="text-gray-500 text-sm">{user?.email}</p>
        </div>
        <div className="pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">Bank account settings and Razorpay Route integration coming in the next update.</p>
        </div>
      </div>
    </div>
  );
}
```

---

## PART 13 — INSTALL PACKAGES

```bash
# Backend
cd eventura-api && npm install xss && npm install -D @types/xss

# No new frontend packages needed
```

---

## VERIFICATION STEPS

Run all of these. Do not stop until all pass:

**Backend:**
```bash
cd eventura-api && npx tsc --noEmit

# Test events now return results
curl http://localhost:4000/events

# Test registration returns proper error instead of stack trace
curl -X POST http://localhost:4000/registrations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -H "x-idempotency-key: test-dupe-001" \
  -d '{"eventId":"21f1169b-d83d-4dfa-b5f4-0a1231bfc30d"}'

# Test brute force — run 6 times with wrong password
for i in {1..6}; do
  curl -X POST http://localhost:4000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@woxsen.edu.in","password":"WrongPassword"}'
  echo ""
done
# 6th attempt should return ACCOUNT_LOCKED
```

**Frontend:**
```bash
cd eventura && npx tsc --noEmit
```

1. `npx tsc --noEmit` → 0 errors ✅
2. `npm run dev` → starts with no errors ✅
3. `/events` → shows events (not empty) ✅
4. Click Register → works without "Registration failed" error ✅
5. `/my-tickets` → View QR button navigates to `/my-tickets/[id]` ✅
6. Admin sidebar → all links work, no `href="#"` scroll jumps ✅
7. Organiser sidebar → all links work ✅
8. `/admin/events` → loads without 404 ✅
9. `/admin/users` → shows real user list ✅
10. `/admin/audit` → shows audit log ✅
11. Logout button in all sidebars → logs out and redirects to `/login` ✅
12. After 5 wrong passwords → login shows lockout message ✅

---

## FILES ALLOWED TO TOUCH — COMPLETE LIST

**Backend — modify existing:**
- `src/modules/events/events.service.ts` — fix events filter
- `src/modules/registrations/registrations.service.ts` — fix error handling
- `src/modules/registrations/registrations.controller.ts` — handle alreadyRegistered
- `src/middleware/errorHandler.middleware.ts` — fix error handler
- `src/modules/auth/auth.service.ts` — add brute force protection
- `src/app.ts` — fix helmet, CORS, add sanitization middleware

**Backend — create new:**
- `src/shared/utils/sanitize.ts`

**Frontend — create new:**
- `app/(admin)/admin/events/page.tsx`
- `app/(admin)/admin/users/page.tsx`
- `app/(admin)/admin/audit/page.tsx`
- `app/(attendee)/profile/page.tsx`
- `app/(organiser)/org/members/page.tsx`
- `app/(organiser)/org/settings/page.tsx`

**Frontend — modify existing:**
- `components/layout/AdminSidebar.tsx` — logout + fix href="#"
- `components/layout/OrgSidebar.tsx` — logout + fix href="#"
- `components/layout/AttendeeNavbar.tsx` — logout + fix href="#"
- `app/(attendee)/my-tickets/page.tsx` — fix View QR button

**Everything else → DO NOT TOUCH.**
