# EVENTURA — ANTIGRAVITY MISSION 6
## Registrations, QR Codes & My Tickets

---

## CRITICAL RULES — READ BEFORE TOUCHING ANY FILE

1. **DO NOT modify any className, color, layout, font, or spacing** — UI is pixel-perfect from Stitch.
2. **DO NOT modify any backend files from previous missions** unless explicitly listed below.
3. **DO NOT modify `prisma/schema.prisma`** — it is complete and migrated.
4. **DO NOT run `prisma migrate`** — schema is already in the database.
5. **Only touch files explicitly listed at the bottom of this prompt.**

---

## PROJECT CONTEXT

### What exists and is working:
- Auth: signup, login, JWT, OTP ✅
- Events: browse, detail, create, publish, readiness ✅
- Frontend running on `http://localhost:3001`
- Backend running on `http://localhost:4000`

### Confirmed working endpoints:
```
POST /auth/login           ✅
GET  /events               ✅
GET  /events/:id           ✅
POST /events               ✅
POST /events/:id/publish   ✅
```

### Key confirmed data:
- Test user ID: `f9e27a18-b5c3-41ba-9897-35dd03a35e4a`
- Test user college: Woxsen University (`d1e6c877-afcb-45f8-aea6-18e1b1514312`)
- Seeded events include free event (TechFest) and paid event (Design Thinking Bootcamp)

### Prisma models to use:
```
Registration (id, userId, eventId, status, paymentStatus, qrToken, qrNonce, checkedInAt, idempotencyKey)
Waitlist (id, userId, eventId, position)
Payment (id, registrationId, amount, platformFee, organizerAmount, status, idempotencyKey)
```

### Enums:
```typescript
RegistrationStatus: REGISTERED | WAITLISTED | CANCELLED | CHECKED_IN
PaymentStatus: FREE | PENDING | PAID | FAILED | REFUNDED
```

### Key middleware available:
```typescript
import { authenticate } from '@middleware/auth.middleware';
import { requireRole } from '@middleware/rbac.middleware';
import { asyncHandler } from '@shared/utils/asyncHandler';
import { apiResponse } from '@shared/utils/apiResponse';
import { prismaAdmin } from '@config/database';
import { redis } from '@config/redis';
```

---

## PART 1 — INSTALL REQUIRED PACKAGES

### Backend (`eventura-api/`):
```bash
npm install qrcode crypto-js uuid
npm install -D @types/qrcode @types/uuid
```

### Frontend (`eventura/`):
```bash
npm install qrcode.react
npm install -D @types/qrcode.react
```

---

## PART 2 — BACKEND: REGISTRATIONS MODULE

Create all files inside `src/modules/registrations/`:

```
src/modules/registrations/
├── registrations.types.ts
├── registrations.service.ts
├── registrations.controller.ts
└── registrations.routes.ts
```

---

### `registrations.types.ts`

```typescript
export interface RegisterEventDto {
  eventId: string;
  idempotencyKey: string;  // Frontend generates this: crypto.randomUUID()
}

export interface CancelRegistrationDto {
  reason?: string;
}
```

---

### `registrations.service.ts`

Implement these functions:

---

#### `registerForEvent(dto: RegisterEventDto, userId: string, collegeId: string)`

This is the most critical function — implement with full idempotency:

```typescript
export async function registerForEvent(dto, userId, collegeId) {
  // 1. Check idempotency — if same key exists, return existing registration
  const existing = await prismaAdmin.registration.findUnique({
    where: { idempotencyKey: dto.idempotencyKey },
    include: { event: true }
  });
  if (existing) return existing;

  // 2. Get event and validate
  const event = await prismaAdmin.event.findUnique({
    where: { id: dto.eventId },
    include: { _count: { select: { registrations: { where: { status: { in: ['REGISTERED', 'CHECKED_IN'] } } } } } }
  });
  if (!event) throw new Error('EVENT_NOT_FOUND');
  if (event.status !== 'PUBLISHED') throw new Error('EVENT_NOT_PUBLISHED');

  // 3. Check if user already registered
  const alreadyRegistered = await prismaAdmin.registration.findUnique({
    where: { userId_eventId: { userId, eventId: dto.eventId } }
  });
  if (alreadyRegistered && alreadyRegistered.status !== 'CANCELLED') {
    throw new Error('ALREADY_REGISTERED');
  }

  // 4. Check visibility — can this user access this event?
  const canAccess = await checkEventVisibility(event, collegeId);
  if (!canAccess) throw new Error('EVENT_NOT_ACCESSIBLE');

  // 5. Check capacity
  const currentRegistrations = event._count.registrations;
  const isAtCapacity = event.maxCapacity && currentRegistrations >= event.maxCapacity;

  // 6. Generate HMAC-signed QR token
  const qrToken = generateQRToken(userId, dto.eventId);

  // 7. If at capacity → add to waitlist instead
  if (isAtCapacity) {
    const waitlistPosition = await prismaAdmin.waitlist.count({
      where: { eventId: dto.eventId }
    }) + 1;

    const registration = await prismaAdmin.registration.create({
      data: {
        userId,
        eventId: dto.eventId,
        status: 'WAITLISTED',
        paymentStatus: event.isFree ? 'FREE' : 'PENDING',
        idempotencyKey: dto.idempotencyKey,
        qrToken,
      }
    });

    await prismaAdmin.waitlist.create({
      data: { userId, eventId: dto.eventId, position: waitlistPosition }
    });

    return { ...registration, waitlisted: true, waitlistPosition };
  }

  // 8. Create registration
  const registration = await prismaAdmin.registration.create({
    data: {
      userId,
      eventId: dto.eventId,
      status: 'REGISTERED',
      paymentStatus: event.isFree ? 'FREE' : 'PENDING',
      idempotencyKey: dto.idempotencyKey,
      qrToken,
    }
  });

  // 9. Store QR token in Redis for fast validation (TTL = event end date)
  const ttl = Math.floor((new Date(event.endDate).getTime() - Date.now()) / 1000) + 86400;
  await redis.setex(`qr:${qrToken}`, ttl, JSON.stringify({
    registrationId: registration.id,
    userId,
    eventId: dto.eventId,
    used: false,
  }));

  // 10. Create payment record if paid event
  if (!event.isFree) {
    await prismaAdmin.payment.create({
      data: {
        registrationId: registration.id,
        amount: event.ticketPrice,
        platformFee: 0,
        organizerAmount: event.ticketPrice,
        currency: 'INR',
        status: 'PENDING',
        idempotencyKey: `payment-${dto.idempotencyKey}`,
      }
    });
  }

  return { ...registration, waitlisted: false };
}
```

---

#### `generateQRToken(userId: string, eventId: string): string`

```typescript
import * as crypto from 'crypto';

function generateQRToken(userId: string, eventId: string): string {
  const secret = process.env.JWT_SECRET!;
  const payload = `${userId}:${eventId}:${Date.now()}`;
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${Buffer.from(payload).toString('base64url')}.${signature}`;
}
```

---

#### `checkEventVisibility(event: any, userCollegeId: string): Promise<boolean>`

```typescript
async function checkEventVisibility(event, userCollegeId) {
  if (event.visibility === 'PUBLIC') return true;
  if (event.visibility === 'ALL_PLATFORM') return true;
  if (event.visibility === 'ONLY_MY_COLLEGE') return event.collegeId === userCollegeId;
  if (event.visibility === 'SELECTED_COLLEGES') {
    const shared = await prismaAdmin.sharedEvent.findFirst({
      where: { eventId: event.id, collegeId: userCollegeId }
    });
    return !!shared;
  }
  return false;
}
```

---

#### `getUserRegistrations(userId: string)`

Returns all registrations for a user with full event details:

```typescript
export async function getUserRegistrations(userId: string) {
  return prismaAdmin.registration.findMany({
    where: { userId, status: { not: 'CANCELLED' } },
    include: {
      event: {
        include: {
          college: { select: { name: true, logoUrl: true } },
          club: { select: { name: true } },
          sessions: { orderBy: { startTime: 'asc' } },
        }
      },
      payment: true,
    },
    orderBy: { createdAt: 'desc' }
  });
}
```

---

#### `getRegistrationById(registrationId: string, userId: string)`

Returns single registration with full event details.
Throws 404 if not found or doesn't belong to userId.
Throws 403 if registration belongs to different user.

---

#### `cancelRegistration(registrationId: string, userId: string)`

- Find registration, verify it belongs to userId
- Verify status is REGISTERED or WAITLISTED (not CHECKED_IN or already CANCELLED)
- Set `status: 'CANCELLED'`
- If was WAITLISTED → delete from Waitlist table, shift other waitlist positions up
- If was REGISTERED and payment was PAID → set `payment.status: 'REFUNDED'`
- If was REGISTERED and event had waitlist → promote first waitlist entry to REGISTERED
- Return updated registration

---

#### `getEventAttendees(eventId: string, organizerCollegeId: string)`

- Verify event belongs to organizerCollegeId
- Return all non-cancelled registrations with user details:
```typescript
return prismaAdmin.registration.findMany({
  where: { eventId, status: { not: 'CANCELLED' } },
  include: {
    user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
    payment: true,
  },
  orderBy: { createdAt: 'asc' }
});
```

---

### `registrations.controller.ts`

```typescript
export const registerForEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.body;
  const idempotencyKey = req.headers['x-idempotency-key'] as string || `${req.user!.sub}-${eventId}-${Date.now()}`;
  
  const result = await registrationsService.registerForEvent(
    { eventId, idempotencyKey },
    req.user!.sub,
    req.user!.activeContext.collegeId
  );

  if (result.waitlisted) {
    return apiResponse.success(res, result, `Added to waitlist at position ${result.waitlistPosition}`, 202);
  }
  return apiResponse.created(res, result, 'Successfully registered for event');
});

export const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await registrationsService.getUserRegistrations(req.user!.sub);
  return apiResponse.success(res, registrations);
});

export const getRegistrationById = asyncHandler(async (req, res) => {
  const registration = await registrationsService.getRegistrationById(
    req.params.id,
    req.user!.sub
  );
  return apiResponse.success(res, registration);
});

export const cancelRegistration = asyncHandler(async (req, res) => {
  const registration = await registrationsService.cancelRegistration(
    req.params.id,
    req.user!.sub
  );
  return apiResponse.success(res, registration, 'Registration cancelled');
});

export const getEventAttendees = asyncHandler(async (req, res) => {
  const attendees = await registrationsService.getEventAttendees(
    req.params.eventId,
    req.user!.activeContext.collegeId
  );
  return apiResponse.success(res, attendees);
});
```

---

### `registrations.routes.ts`

```typescript
import { Router } from 'express';
import { authenticate } from '@middleware/auth.middleware';
import { requireRole } from '@middleware/rbac.middleware';
import * as registrationsController from './registrations.controller';

const router = Router();

// Attendee routes
router.post('/', authenticate, registrationsController.registerForEvent);
router.get('/my', authenticate, registrationsController.getMyRegistrations);
router.get('/my/:id', authenticate, registrationsController.getRegistrationById);
router.post('/my/:id/cancel', authenticate, registrationsController.cancelRegistration);

// Organiser routes
router.get(
  '/event/:eventId',
  authenticate,
  requireRole('COLLEGE_ADMIN', 'CLUB_PRESIDENT', 'EVENT_MANAGER'),
  registrationsController.getEventAttendees
);

export default router;
```

---

## PART 3 — BACKEND: QR MODULE

Create `src/modules/qr/qr.routes.ts`:

```typescript
import { Router } from 'express';
import { authenticate } from '@middleware/auth.middleware';
import { asyncHandler } from '@shared/utils/asyncHandler';
import { apiResponse } from '@shared/utils/apiResponse';
import { prismaAdmin } from '@config/database';
import { redis } from '@config/redis';
import * as crypto from 'crypto';

const router = Router();

// GET /qr/:registrationId — get QR data for a registration (attendee's own ticket)
router.get('/:registrationId', authenticate, asyncHandler(async (req, res) => {
  const registration = await prismaAdmin.registration.findFirst({
    where: {
      id: req.params.registrationId,
      userId: req.user!.sub,  // Can only get your own QR
    },
    include: {
      event: {
        select: { title: true, startDate: true, endDate: true, venue: true, status: true }
      }
    }
  });

  if (!registration) {
    return apiResponse.error(res, 'REGISTRATION_NOT_FOUND', 'Registration not found', 404);
  }

  if (registration.status === 'CANCELLED') {
    return apiResponse.error(res, 'REGISTRATION_CANCELLED', 'This registration has been cancelled', 400);
  }

  if (registration.paymentStatus === 'PENDING') {
    return apiResponse.error(res, 'PAYMENT_PENDING', 'Complete payment to access QR code', 402);
  }

  // Generate rotating nonce (refresh every 60 seconds)
  const nonceKey = `nonce:${registration.id}`;
  let nonce = await redis.get(nonceKey);
  if (!nonce) {
    nonce = crypto.randomBytes(16).toString('hex');
    await redis.setex(nonceKey, 60, nonce);
  }

  return apiResponse.success(res, {
    qrToken: registration.qrToken,
    nonce,
    registrationId: registration.id,
    eventTitle: registration.event.title,
    eventDate: registration.event.startDate,
    venue: registration.event.venue,
    status: registration.status,
  });
}));

// POST /qr/validate — validate a QR scan (Event Manager only)
router.post('/validate', authenticate, asyncHandler(async (req, res) => {
  const { qrToken, eventId } = req.body;

  if (!qrToken || !eventId) {
    return apiResponse.error(res, 'INVALID_REQUEST', 'qrToken and eventId are required', 400);
  }

  // 1. Look up QR token in Redis first (fast path)
  const redisKey = `qr:${qrToken}`;
  const cachedData = await redis.get(redisKey);

  if (!cachedData) {
    // Try database fallback
    const registration = await prismaAdmin.registration.findFirst({
      where: { qrToken },
      include: { user: { select: { firstName: true, lastName: true, email: true } } }
    });

    if (!registration) {
      return apiResponse.success(res, { result: 'INVALID', message: 'Invalid QR code' });
    }

    // Continue with DB data
    if (registration.eventId !== eventId) {
      return apiResponse.success(res, { result: 'INVALID', message: 'QR code is for a different event' });
    }

    if (registration.status === 'CHECKED_IN') {
      return apiResponse.success(res, {
        result: 'DUPLICATE',
        message: 'Already checked in',
        checkedInAt: registration.checkedInAt,
        attendee: registration.user,
      });
    }

    if (registration.status !== 'REGISTERED') {
      return apiResponse.success(res, { result: 'INVALID', message: `Registration status: ${registration.status}` });
    }

    if (registration.paymentStatus === 'PENDING') {
      return apiResponse.success(res, { result: 'PAYMENT_PENDING', message: 'Payment not completed' });
    }
  }

  // 2. Atomic Redis SETNX to prevent double-scan race condition
  const lockKey = `checkin-lock:${qrToken}`;
  const lockAcquired = await redis.set(lockKey, '1', 'EX', 30, 'NX');

  if (!lockAcquired) {
    return apiResponse.success(res, { result: 'DUPLICATE', message: 'Check-in already in progress' });
  }

  try {
    // 3. Get registration from DB for final check
    const registration = await prismaAdmin.registration.findFirst({
      where: { qrToken },
      include: { user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } } }
    });

    if (!registration || registration.eventId !== eventId) {
      return apiResponse.success(res, { result: 'INVALID', message: 'Invalid QR code' });
    }

    if (registration.status === 'CHECKED_IN') {
      return apiResponse.success(res, {
        result: 'DUPLICATE',
        message: 'Already checked in',
        checkedInAt: registration.checkedInAt,
        attendee: registration.user,
      });
    }

    if (registration.paymentStatus === 'PENDING') {
      return apiResponse.success(res, { result: 'PAYMENT_PENDING', message: 'Payment not completed' });
    }

    // 4. Mark as checked in using Prisma transaction (idempotent upsert pattern)
    const updated = await prismaAdmin.$transaction(async (tx) => {
      const current = await tx.registration.findUnique({ where: { id: registration.id } });
      if (current?.status === 'CHECKED_IN') return current;
      
      return tx.registration.update({
        where: { id: registration.id },
        data: { status: 'CHECKED_IN', checkedInAt: new Date() }
      });
    });

    // 5. Log scan
    await prismaAdmin.scanLog.create({
      data: {
        registrationId: registration.id,
        scannedBy: req.user!.sub,
        result: 'SUCCESS',
        ipAddress: req.ip,
      }
    });

    // 6. Remove from Redis (token used)
    await redis.del(redisKey);

    return apiResponse.success(res, {
      result: 'SUCCESS',
      message: 'Check-in successful',
      attendee: registration.user,
      checkedInAt: updated.checkedInAt,
    });

  } finally {
    // Always release lock
    await redis.del(lockKey);
  }
}));

export default router;
```

---

## PART 4 — REGISTER ROUTES IN APP.TS

Add to `src/app.ts` — **only these two additions:**

```typescript
import registrationsRoutes from '@modules/registrations/registrations.routes';
import qrRoutes from '@modules/qr/qr.routes';

app.use('/registrations', registrationsRoutes);
app.use('/qr', qrRoutes);
```

---

## PART 5 — FRONTEND: REGISTRATIONS API CLIENT

Create `eventura/lib/api/registrations.api.ts`:

```typescript
import apiClient from './client';
import { v4 as uuidv4 } from 'uuid';

export const registrationsApi = {
  // Register for event — generates idempotency key automatically
  register: (eventId: string) =>
    apiClient.post('/registrations', { eventId }, {
      headers: { 'x-idempotency-key': `${eventId}-${uuidv4()}` }
    }),

  // Get all my registrations (tickets)
  getMyRegistrations: () =>
    apiClient.get('/registrations/my'),

  // Get single registration
  getRegistrationById: (id: string) =>
    apiClient.get(`/registrations/my/${id}`),

  // Cancel registration
  cancelRegistration: (id: string) =>
    apiClient.post(`/registrations/my/${id}/cancel`),

  // Get QR data for a ticket
  getQRData: (registrationId: string) =>
    apiClient.get(`/qr/${registrationId}`),

  // Validate QR (for scanner)
  validateQR: (qrToken: string, eventId: string) =>
    apiClient.post('/qr/validate', { qrToken, eventId }),

  // Get event attendees (organiser)
  getEventAttendees: (eventId: string) =>
    apiClient.get(`/registrations/event/${eventId}`),
};
```

Also install `uuid` in frontend:
```bash
npm install uuid && npm install -D @types/uuid
```

---

## PART 6 — WIRE EVENT DETAIL REGISTRATION BUTTON

File: `eventura/app/(attendee)/events/[id]/page.tsx`

Replace the placeholder `setIsPurchased(true)` with real registration:

### Add state:
```typescript
const [registrationId, setRegistrationId] = useState<string | null>(null);
const [isRegistering, setIsRegistering] = useState(false);
const [registrationError, setRegistrationError] = useState('');
const [isWaitlisted, setIsWaitlisted] = useState(false);
const { isAuthenticated } = useAuthStore();
const router = useRouter();
```

### Check if already registered on load:
```typescript
useEffect(() => {
  if (!isAuthenticated || !event) return;
  registrationsApi.getMyRegistrations()
    .then(res => {
      const existing = res.data.data.find((r: any) => r.eventId === event.id && r.status !== 'CANCELLED');
      if (existing) {
        setIsPurchased(true);
        setRegistrationId(existing.id);
        setIsWaitlisted(existing.status === 'WAITLISTED');
      }
    })
    .catch(() => {});
}, [event, isAuthenticated]);
```

### Real registration handler:
```typescript
const handleRegister = async () => {
  if (!isAuthenticated) {
    router.push(`/login?redirect=/events/${params.id}`);
    return;
  }
  setIsRegistering(true);
  setRegistrationError('');
  try {
    const response = await registrationsApi.register(event.id);
    const data = response.data.data;
    setRegistrationId(data.id);
    setIsPurchased(true);
    if (data.waitlisted) {
      setIsWaitlisted(true);
    }
  } catch (err: any) {
    const code = err.response?.data?.error?.code;
    if (code === 'ALREADY_REGISTERED') {
      setIsPurchased(true);
    } else {
      setRegistrationError(err.response?.data?.error?.message || 'Registration failed. Please try again.');
    }
  } finally {
    setIsRegistering(false);
  }
};
```

### Update registration button display:
```tsx
{isPurchased && !isWaitlisted && (
  <button onClick={() => router.push('/my-tickets')} className="...existing classes...">
    ✓ Registered — View Ticket
  </button>
)}
{isPurchased && isWaitlisted && (
  <button disabled className="...existing classes... opacity-75">
    You're on the waitlist
  </button>
)}
{!isPurchased && (
  <button onClick={handleRegister} disabled={isRegistering} className="...existing classes...">
    {isRegistering ? 'Registering...' : event?.isFree ? 'Register for Free' : `Register — ₹${event?.ticketPrice}`}
  </button>
)}
{registrationError && (
  <p className="text-sm text-red-500 text-center mt-2">{registrationError}</p>
)}
```

---

## PART 7 — WIRE MY TICKETS PAGE

File: `eventura/app/(attendee)/my-tickets/page.tsx`

### Add `"use client"` at top.

### Replace all mock data with real API:

```typescript
const [registrations, setRegistrations] = useState<any[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [selectedTicket, setSelectedTicket] = useState<any>(null);

useEffect(() => {
  registrationsApi.getMyRegistrations()
    .then(res => setRegistrations(res.data.data))
    .catch(console.error)
    .finally(() => setIsLoading(false));
}, []);
```

### Wire ticket cards to real data:
Map `registrations` to existing ticket card components:
- `registration.event.title` → event name
- `registration.event.college?.name` → organiser
- `registration.event.startDate` → formatted date
- `registration.event.venue` → venue
- `registration.status` → status badge (REGISTERED=green, WAITLISTED=yellow, CHECKED_IN=blue)
- `registration.paymentStatus` → payment badge
- Card `onClick` → `setSelectedTicket(registration)` to show QR modal

### Loading skeleton while fetching.

### Empty state when no registrations.

---

## PART 8 — CREATE MY TICKETS DETAIL PAGE (QR VIEW)

File: `eventura/app/(attendee)/my-tickets/[id]/page.tsx`

Create this page if it doesn't exist:

```tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { registrationsApi } from '@/lib/api/registrations.api';
import QRCode from 'qrcode.react';

export default function TicketDetailPage() {
  const [qrData, setQrData] = useState<any>(null);
  const [registration, setRegistration] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const [regRes, qrRes] = await Promise.all([
          registrationsApi.getRegistrationById(params.id as string),
          registrationsApi.getQRData(params.id as string),
        ]);
        setRegistration(regRes.data.data);
        setQrData(qrRes.data.data);
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to load ticket');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTicket();

    // Refresh QR nonce every 55 seconds (nonce expires every 60s)
    const interval = setInterval(async () => {
      try {
        const qrRes = await registrationsApi.getQRData(params.id as string);
        setQrData(qrRes.data.data);
      } catch (err) {
        console.error('QR refresh failed', err);
      }
    }, 55000);

    return () => clearInterval(interval);
  }, [params.id]);

  // QR value = combine token + nonce for security
  const qrValue = qrData ? `${qrData.qrToken}|${qrData.nonce}|${qrData.registrationId}` : '';

  // Match the existing design system — Deep Indigo (#2E3192) background for QR section
  // Show: event title, date, venue, attendee name, status badge
  // Large centered QR code (256x256)
  // "Refreshes every 60 seconds" subtitle under QR
  // Cancel Registration button (only if status === 'REGISTERED')
  // Back button
}
```

---

## PART 9 — WIRE SCANNER PAGE

File: `eventura/app/(organiser)/org/events/[id]/scanner/page.tsx`

This page uses the device camera to scan QR codes. Replace mock scan states with real API validation.

### Add state:
```typescript
const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'duplicate' | 'invalid' | 'payment_pending'>('idle');
const [scanResult, setScanResult] = useState<any>(null);
const [isValidating, setIsValidating] = useState(false);
const params = useParams();
```

### Handle QR scan result from camera:
The existing scanner page likely uses `zxing` or a similar library. Find the existing `onScan` or `onResult` callback and replace its body with:

```typescript
const handleScan = async (qrValue: string) => {
  if (isValidating) return; // Prevent double-scan
  setIsValidating(true);

  try {
    // QR value format: `${qrToken}|${nonce}|${registrationId}`
    const parts = qrValue.split('|');
    const qrToken = parts[0];
    const eventId = params.id as string;

    const response = await registrationsApi.validateQR(qrToken, eventId);
    const { result, message, attendee, checkedInAt } = response.data.data;

    setScanResult({ result, message, attendee, checkedInAt });

    // Map result to scan state
    if (result === 'SUCCESS') setScanState('success');
    else if (result === 'DUPLICATE') setScanState('duplicate');
    else if (result === 'PAYMENT_PENDING') setScanState('payment_pending');
    else setScanState('invalid');

    // Auto-reset to idle after 3 seconds
    setTimeout(() => {
      setScanState('idle');
      setScanResult(null);
      setIsValidating(false);
    }, 3000);

  } catch (err) {
    setScanState('invalid');
    setScanResult({ result: 'INVALID', message: 'Scan failed. Try again.' });
    setTimeout(() => {
      setScanState('idle');
      setScanResult(null);
      setIsValidating(false);
    }, 3000);
  }
};
```

### Wire existing feedback states to real data:
The scanner page already has `success`, `duplicate`, `invalid` visual states. Wire them to `scanState` and show `scanResult.attendee.firstName + ' ' + scanResult.attendee.lastName` in the success state.

---

## PART 10 — WIRE ATTENDEES PAGE

File: `eventura/app/(organiser)/org/events/[id]/attendees/page.tsx`

Create if it doesn't exist:

```tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { registrationsApi } from '@/lib/api/registrations.api';

export default function AttendeesPage() {
  const [attendees, setAttendees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();

  useEffect(() => {
    registrationsApi.getEventAttendees(params.id as string)
      .then(res => setAttendees(res.data.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [params.id]);

  // Table with columns: Name, Email, Status, Payment, Check-in Time
  // Status badge: REGISTERED=green, CHECKED_IN=blue, WAITLISTED=yellow
  // Export button (download as CSV) — client-side CSV generation
  // Use existing organiser layout and table styling
  // Loading skeleton while fetching
}
```

Add CSV export function:
```typescript
const exportCSV = () => {
  const headers = ['Name', 'Email', 'Status', 'Payment', 'Checked In At'];
  const rows = attendees.map(a => [
    `${a.user.firstName} ${a.user.lastName}`,
    a.user.email,
    a.status,
    a.paymentStatus,
    a.checkedInAt ? new Date(a.checkedInAt).toLocaleString('en-IN') : 'Not checked in'
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `attendees-${params.id}.csv`;
  a.click();
};
```

---

## PART 11 — REGISTER ROUTES IN BACKEND

Add to `src/app.ts`:
```typescript
import registrationsRoutes from '@modules/registrations/registrations.routes';
import qrRoutes from '@modules/qr/qr.routes';
app.use('/registrations', registrationsRoutes);
app.use('/qr', qrRoutes);
```

---

## VERIFICATION STEPS

Run all of these. Do not stop until all pass:

**Backend tests:**
```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@woxsen.edu.in","password":"Test@1234"}' \
  | node -e "process.stdin.resume();let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).data.accessToken))")

# Get first published event ID
EVENT_ID=$(curl -s http://localhost:4000/events \
  | node -e "process.stdin.resume();let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).data[0].id))")

echo "Event ID: $EVENT_ID"

# Test 1 — Register for event
curl -X POST http://localhost:4000/registrations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-idempotency-key: test-key-001" \
  -d "{\"eventId\":\"$EVENT_ID\"}"

# Test 2 — Idempotency (same key = same result, no duplicate)
curl -X POST http://localhost:4000/registrations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-idempotency-key: test-key-001" \
  -d "{\"eventId\":\"$EVENT_ID\"}"

# Test 3 — Get my registrations
curl http://localhost:4000/registrations/my \
  -H "Authorization: Bearer $TOKEN"

# Test 4 — Get QR data
REG_ID=$(curl -s http://localhost:4000/registrations/my \
  -H "Authorization: Bearer $TOKEN" \
  | node -e "process.stdin.resume();let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).data[0].id))")

curl http://localhost:4000/qr/$REG_ID \
  -H "Authorization: Bearer $TOKEN"
```

**All must return `success: true`** ✅

**Frontend tests:**
1. `npx tsc --noEmit` → 0 errors ✅
2. `npm run dev` → starts with no errors ✅
3. Open `/events` → click "Register for Free" on TechFest → button changes to "✓ Registered — View Ticket" ✅
4. Open `/my-tickets` → ticket card appears with event details ✅
5. Click ticket → `/my-tickets/[id]` → QR code renders ✅
6. QR code refreshes every 55 seconds ✅
7. Open `/org/events/[id]/scanner` → camera activates ✅

---

## FILES ALLOWED TO TOUCH — COMPLETE LIST

**Backend — create new:**
- `src/modules/registrations/registrations.types.ts`
- `src/modules/registrations/registrations.service.ts`
- `src/modules/registrations/registrations.controller.ts`
- `src/modules/registrations/registrations.routes.ts`
- `src/modules/qr/qr.routes.ts`

**Backend — modify existing:**
- `src/app.ts` — add 4 lines only (2 imports + 2 app.use)

**Frontend — create new:**
- `lib/api/registrations.api.ts`
- `app/(attendee)/my-tickets/[id]/page.tsx`
- `app/(organiser)/org/events/[id]/attendees/page.tsx`

**Frontend — modify existing:**
- `app/(attendee)/events/[id]/page.tsx` — wire real registration
- `app/(attendee)/my-tickets/page.tsx` — wire real tickets list

**Everything else → DO NOT TOUCH.**
