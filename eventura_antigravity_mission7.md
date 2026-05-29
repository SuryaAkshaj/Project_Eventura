# EVENTURA — ANTIGRAVITY MISSION 7
## Payments: Razorpay Integration

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
- Auth: signup, login, JWT ✅
- Events: browse, detail, create, publish ✅
- Registrations: register, QR generation, tickets ✅
- Frontend running on `http://localhost:3001`
- Backend running on `http://localhost:4000`
- ngrok running: `https://defensive-hate-saxophone.ngrok-free.app`

### Confirmed Razorpay credentials in `.env`:
```
RAZORPAY_KEY_ID="rzp_test_SuVFmBnqnarfMx"
RAZORPAY_KEY_SECRET="DIbmGCO2qWJjCGcH63h73b2W"
RAZORPAY_WEBHOOK_SECRET="eventura_webhook_2026"
```

### Confirmed working endpoints:
```
POST /registrations          → creates registration + payment record for paid events ✅
GET  /registrations/my       → returns registrations with payment field ✅
GET  /qr/:registrationId     → returns QR only if paymentStatus !== PENDING ✅
POST /qr/validate            → returns PAYMENT_PENDING if not paid ✅
```

### Confirmed Payment model in Prisma:
```prisma
model Payment {
  id                  String        @id
  registrationId      String        @unique
  razorpayOrderId     String?       @unique
  razorpayPaymentId   String?       @unique
  amount              Decimal
  platformFee         Decimal       @default(0)
  organizerAmount     Decimal
  currency            String        @default("INR")
  status              PaymentStatus  // PENDING | PAID | FAILED | REFUNDED
  webhookReceived     Boolean       @default(false)
  idempotencyKey      String        @unique
  paidAt              DateTime?
  refundedAt          DateTime?
}
```

### How Razorpay basic payment flow works:
1. Backend creates a Razorpay Order → gets `orderId`
2. Frontend opens Razorpay checkout with `orderId`
3. User pays on Razorpay's UI
4. Razorpay calls our webhook with payment confirmation
5. Backend verifies webhook signature → marks payment as PAID
6. Frontend also verifies payment client-side as fallback
7. QR code becomes accessible after payment is confirmed

---

## PART 1 — INSTALL RAZORPAY SDK

### Backend (`eventura-api/`):
```bash
npm install razorpay
npm install -D @types/razorpay
```

### Frontend (`eventura/`):
No new packages needed — Razorpay checkout is loaded via script tag.

---

## PART 2 — BACKEND: PAYMENTS MODULE

Create all files inside `src/modules/payments/`:

```
src/modules/payments/
├── payments.service.ts
├── payments.controller.ts
└── payments.routes.ts
```

---

### `payments.service.ts`

```typescript
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { prismaAdmin } from '@config/database';
import { env } from '@config/env';

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});
```

Implement these functions:

---

#### `createOrder(registrationId: string, userId: string)`

Creates a Razorpay order for a pending payment:

```typescript
export async function createOrder(registrationId: string, userId: string) {
  // 1. Get registration and verify it belongs to userId
  const registration = await prismaAdmin.registration.findFirst({
    where: { id: registrationId, userId },
    include: { 
      event: { select: { title: true, ticketPrice: true, isFree: true } },
      payment: true 
    }
  });

  if (!registration) throw { code: 'NOT_FOUND', message: 'Registration not found', status: 404 };
  if (registration.event.isFree) throw { code: 'FREE_EVENT', message: 'This event is free', status: 400 };
  if (!registration.payment) throw { code: 'NO_PAYMENT', message: 'No payment record found', status: 400 };

  // 2. If already paid return existing order
  if (registration.payment.status === 'PAID') {
    return { alreadyPaid: true, payment: registration.payment };
  }

  // 3. If Razorpay order already created, return existing orderId
  if (registration.payment.razorpayOrderId) {
    return {
      orderId: registration.payment.razorpayOrderId,
      amount: Number(registration.payment.amount) * 100, // Razorpay uses paise
      currency: 'INR',
      keyId: env.RAZORPAY_KEY_ID,
      eventTitle: registration.event.title,
      registrationId,
    };
  }

  // 4. Create Razorpay order
  const amountInPaise = Math.round(Number(registration.payment.amount) * 100);
  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt: `reg_${registrationId.slice(0, 20)}`,
    notes: {
      registrationId,
      eventTitle: registration.event.title,
      userId,
    },
  });

  // 5. Store orderId in Payment record
  await prismaAdmin.payment.update({
    where: { registrationId },
    data: { razorpayOrderId: order.id }
  });

  return {
    orderId: order.id,
    amount: amountInPaise,
    currency: 'INR',
    keyId: env.RAZORPAY_KEY_ID,
    eventTitle: registration.event.title,
    registrationId,
  };
}
```

---

#### `verifyPayment(registrationId: string, razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string, userId: string)`

Client-side payment verification (fallback if webhook is slow):

```typescript
export async function verifyPayment(
  registrationId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  userId: string
) {
  // 1. Verify signature
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    throw { code: 'INVALID_SIGNATURE', message: 'Payment verification failed', status: 400 };
  }

  // 2. Get registration
  const registration = await prismaAdmin.registration.findFirst({
    where: { id: registrationId, userId },
    include: { payment: true }
  });

  if (!registration) throw { code: 'NOT_FOUND', message: 'Registration not found', status: 404 };
  if (registration.payment?.status === 'PAID') {
    return { alreadyVerified: true };
  }

  // 3. Use Prisma transaction for idempotent payment confirmation
  const result = await prismaAdmin.$transaction(async (tx) => {
    // Double-check status inside transaction
    const current = await tx.payment.findUnique({
      where: { registrationId }
    });
    if (current?.status === 'PAID') return { alreadyVerified: true };

    // Update payment
    await tx.payment.update({
      where: { registrationId },
      data: {
        razorpayPaymentId,
        status: 'PAID',
        paidAt: new Date(),
        webhookReceived: false, // Will be updated by webhook
      }
    });

    // Update registration payment status
    await tx.registration.update({
      where: { id: registrationId },
      data: { paymentStatus: 'PAID' }
    });

    return { verified: true };
  });

  // 4. Activate QR in Redis
  const reg = await prismaAdmin.registration.findUnique({
    where: { id: registrationId },
    include: { event: { select: { endDate: true } } }
  });

  if (reg?.qrToken) {
    const ttl = Math.floor((new Date(reg.event.endDate).getTime() - Date.now()) / 1000) + 86400;
    if (ttl > 0) {
      const { redis } = await import('@config/redis');
      await redis.setex(`qr:${reg.qrToken}`, ttl, JSON.stringify({
        registrationId,
        userId,
        eventId: reg.eventId,
        used: false,
      }));
    }
  }

  return result;
}
```

---

#### `handleWebhook(rawBody: string, signature: string)`

Handles Razorpay webhook events:

```typescript
export async function handleWebhook(rawBody: string, signature: string) {
  // 1. Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  if (expectedSignature !== signature) {
    throw { code: 'INVALID_SIGNATURE', message: 'Invalid webhook signature', status: 400 };
  }

  const event = JSON.parse(rawBody);
  const eventType = event.event;

  // 2. Handle payment.captured
  if (eventType === 'payment.captured') {
    const payment = event.payload.payment.entity;
    const registrationId = payment.notes?.registrationId;

    if (!registrationId) return { received: true };

    await prismaAdmin.$transaction(async (tx) => {
      const existing = await tx.payment.findUnique({ where: { registrationId } });
      if (existing?.status === 'PAID') return; // Already processed

      await tx.payment.update({
        where: { registrationId },
        data: {
          razorpayPaymentId: payment.id,
          status: 'PAID',
          paidAt: new Date(),
          webhookReceived: true,
        }
      });

      await tx.registration.update({
        where: { id: registrationId },
        data: { paymentStatus: 'PAID' }
      });
    });
  }

  // 3. Handle payment.failed
  if (eventType === 'payment.failed') {
    const payment = event.payload.payment.entity;
    const registrationId = payment.notes?.registrationId;
    if (!registrationId) return { received: true };

    await prismaAdmin.payment.update({
      where: { registrationId },
      data: { status: 'FAILED' }
    });
  }

  // 4. Handle refund.processed
  if (eventType === 'refund.processed') {
    const refund = event.payload.refund.entity;
    const razorpayPaymentId = refund.payment_id;

    const payment = await prismaAdmin.payment.findFirst({
      where: { razorpayPaymentId }
    });

    if (payment) {
      await prismaAdmin.payment.update({
        where: { id: payment.id },
        data: { status: 'REFUNDED', refundedAt: new Date() }
      });

      await prismaAdmin.registration.update({
        where: { id: payment.registrationId },
        data: { paymentStatus: 'REFUNDED' }
      });
    }
  }

  return { received: true };
}
```

---

#### `getOrgPayments(collegeId: string)`

Returns payment summary for organiser payout dashboard:

```typescript
export async function getOrgPayments(collegeId: string) {
  // Get all paid payments for events owned by this college
  const payments = await prismaAdmin.payment.findMany({
    where: {
      status: 'PAID',
      registration: {
        event: { collegeId }
      }
    },
    include: {
      registration: {
        include: {
          event: { select: { title: true, startDate: true } },
          user: { select: { firstName: true, lastName: true, email: true } }
        }
      }
    },
    orderBy: { paidAt: 'desc' }
  });

  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.organizerAmount), 0);
  const totalTransactions = payments.length;
  const totalPlatformFees = payments.reduce((sum, p) => sum + Number(p.platformFee), 0);

  return {
    summary: {
      totalRevenue,
      totalTransactions,
      totalPlatformFees,
      currency: 'INR',
    },
    transactions: payments,
  };
}
```

---

#### `getPlatformPayments()` (Super Admin only)

```typescript
export async function getPlatformPayments() {
  const payments = await prismaAdmin.payment.findMany({
    where: { status: 'PAID' },
    include: {
      registration: {
        include: {
          event: { select: { title: true, collegeId: true, college: { select: { name: true } } } },
        }
      }
    },
    orderBy: { paidAt: 'desc' },
    take: 100,
  });

  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPlatformFees = payments.reduce((sum, p) => sum + Number(p.platformFee), 0);

  return {
    summary: { totalRevenue, totalPlatformFees, totalTransactions: payments.length },
    transactions: payments,
  };
}
```

---

### `payments.controller.ts`

```typescript
import { asyncHandler } from '@shared/utils/asyncHandler';
import { apiResponse } from '@shared/utils/apiResponse';
import * as paymentsService from './payments.service';
import { requireRole } from '@middleware/rbac.middleware';

export const createOrder = asyncHandler(async (req, res) => {
  const { registrationId } = req.body;
  if (!registrationId) {
    return apiResponse.error(res, 'MISSING_FIELD', 'registrationId is required', 400);
  }
  const order = await paymentsService.createOrder(registrationId, req.user!.sub);
  return apiResponse.success(res, order);
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { registrationId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  const result = await paymentsService.verifyPayment(
    registrationId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    req.user!.sub
  );
  return apiResponse.success(res, result, 'Payment verified successfully');
});

export const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'] as string;
  if (!signature) {
    return apiResponse.error(res, 'MISSING_SIGNATURE', 'Webhook signature missing', 400);
  }
  // Use raw body for webhook verification
  const rawBody = (req as any).rawBody;
  const result = await paymentsService.handleWebhook(rawBody, signature);
  return res.status(200).json(result);
});

export const getOrgPayments = asyncHandler(async (req, res) => {
  const result = await paymentsService.getOrgPayments(req.user!.activeContext.collegeId);
  return apiResponse.success(res, result);
});

export const getPlatformPayments = asyncHandler(async (req, res) => {
  const result = await paymentsService.getPlatformPayments();
  return apiResponse.success(res, result);
});
```

---

### `payments.routes.ts`

```typescript
import { Router } from 'express';
import { authenticate } from '@middleware/auth.middleware';
import { requireRole } from '@middleware/rbac.middleware';
import * as paymentsController from './payments.controller';

const router = Router();

// POST /payments/order — create Razorpay order for a registration
router.post('/order', authenticate, paymentsController.createOrder);

// POST /payments/verify — verify payment after checkout (client-side fallback)
router.post('/verify', authenticate, paymentsController.verifyPayment);

// POST /payments/webhook — Razorpay webhook (no auth — verified by signature)
router.post('/webhook', paymentsController.handleWebhook);

// GET /payments/org — organiser payout dashboard
router.get(
  '/org',
  authenticate,
  requireRole('COLLEGE_ADMIN', 'CLUB_PRESIDENT'),
  paymentsController.getOrgPayments
);

// GET /payments/admin — platform-wide payments (Super Admin only)
router.get(
  '/admin',
  authenticate,
  requireRole('SUPER_ADMIN'),
  paymentsController.getPlatformPayments
);

export default router;
```

---

## PART 3 — UPDATE APP.TS FOR RAW BODY

The Razorpay webhook requires the **raw unparsed request body** for signature verification. Update `src/app.ts`:

Find the existing `express.json()` line and replace it with:

```typescript
// Raw body for webhook signature verification
app.use('/payments/webhook', express.raw({ type: 'application/json' }));

// JSON body for all other routes
app.use(express.json({ limit: '10mb' }));
```

Also add payments routes:
```typescript
import paymentsRoutes from '@modules/payments/payments.routes';
app.use('/payments', paymentsRoutes);
```

And in the webhook handler, extract raw body:
```typescript
// In app.ts, add this middleware BEFORE routes:
app.use((req, res, next) => {
  if (req.path === '/payments/webhook') {
    (req as any).rawBody = req.body;
  }
  next();
});
```

---

## PART 4 — FRONTEND: PAYMENTS API CLIENT

Create `eventura/lib/api/payments.api.ts`:

```typescript
import apiClient from './client';

export const paymentsApi = {
  createOrder: (registrationId: string) =>
    apiClient.post('/payments/order', { registrationId }),

  verifyPayment: (data: {
    registrationId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => apiClient.post('/payments/verify', data),

  getOrgPayments: () =>
    apiClient.get('/payments/org'),
};
```

---

## PART 5 — FRONTEND: RAZORPAY CHECKOUT HOOK

Create `eventura/lib/hooks/useRazorpay.ts`:

```typescript
'use client';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function useRazorpay() {
  const loadScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const openCheckout = async (options: {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    eventTitle: string;
    registrationId: string;
    userName: string;
    userEmail: string;
    onSuccess: (data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) => void;
    onFailure: (error: any) => void;
  }) => {
    const loaded = await loadScript();
    if (!loaded) {
      options.onFailure(new Error('Razorpay SDK failed to load'));
      return;
    }

    const rzp = new window.Razorpay({
      key: options.keyId,
      amount: options.amount,
      currency: options.currency,
      order_id: options.orderId,
      name: 'Eventura',
      description: options.eventTitle,
      image: '/logo.png',
      prefill: {
        name: options.userName,
        email: options.userEmail,
      },
      theme: { color: '#2E3192' },
      handler: (response: any) => {
        options.onSuccess({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () => {
          options.onFailure(new Error('Payment cancelled by user'));
        }
      }
    });

    rzp.open();
  };

  return { openCheckout };
}
```

---

## PART 6 — WIRE PAYMENT FLOW IN EVENT DETAIL PAGE

File: `eventura/app/(attendee)/events/[id]/page.tsx`

Find the existing `handleRegister` function and update it to handle paid events:

```typescript
import { paymentsApi } from '@/lib/api/payments.api';
import { useRazorpay } from '@/lib/hooks/useRazorpay';

// Add inside component:
const { openCheckout } = useRazorpay();
const [isProcessingPayment, setIsProcessingPayment] = useState(false);

// Update handleRegister:
const handleRegister = async () => {
  if (!isAuthenticated) {
    router.push(`/login?redirect=/events/${params.id}`);
    return;
  }

  setIsRegistering(true);
  setRegistrationError('');

  try {
    // Step 1: Create registration
    const regResponse = await registrationsApi.register(event.id);
    const registration = regResponse.data.data;
    setRegistrationId(registration.id);

    // Step 2: If free event — done
    if (event.isFree) {
      setIsPurchased(true);
      if (registration.waitlisted) setIsWaitlisted(true);
      return;
    }

    // Step 3: If paid event — create Razorpay order and open checkout
    setIsRegistering(false);
    setIsProcessingPayment(true);

    const orderResponse = await paymentsApi.createOrder(registration.id);
    const orderData = orderResponse.data.data;

    // If already paid (idempotency)
    if (orderData.alreadyPaid) {
      setIsPurchased(true);
      return;
    }

    // Step 4: Open Razorpay checkout
    await openCheckout({
      orderId: orderData.orderId,
      amount: orderData.amount,
      currency: orderData.currency,
      keyId: orderData.keyId,
      eventTitle: orderData.eventTitle,
      registrationId: registration.id,
      userName: `${user?.firstName} ${user?.lastName}`,
      userEmail: user?.email || '',
      onSuccess: async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
        try {
          await paymentsApi.verifyPayment({
            registrationId: registration.id,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
          });
          setIsPurchased(true);
        } catch (err) {
          setRegistrationError('Payment completed but verification failed. Please contact support.');
        } finally {
          setIsProcessingPayment(false);
        }
      },
      onFailure: (error) => {
        if (error.message !== 'Payment cancelled by user') {
          setRegistrationError('Payment failed. Please try again.');
        }
        setIsProcessingPayment(false);
      },
    });

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

### Update register button to show payment processing state:
```tsx
<button
  onClick={handleRegister}
  disabled={isRegistering || isProcessingPayment}
  className="...existing classes..."
>
  {isRegistering && 'Creating registration...'}
  {isProcessingPayment && 'Processing payment...'}
  {!isRegistering && !isProcessingPayment && (
    event?.isFree ? 'Register for Free' : `Register — ₹${event?.ticketPrice}`
  )}
</button>
```

---

## PART 7 — WIRE ORGANISER PAYOUT DASHBOARD

File: `eventura/app/(organiser)/org/payments/page.tsx`

Replace mock data with real API:

```typescript
'use client';
import { useState, useEffect } from 'react';
import { paymentsApi } from '@/lib/api/payments.api';

// Add state:
const [paymentsData, setPaymentsData] = useState<any>(null);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  paymentsApi.getOrgPayments()
    .then(res => setPaymentsData(res.data.data))
    .catch(console.error)
    .finally(() => setIsLoading(false));
}, []);
```

Wire existing UI elements to real data:
- Total revenue card → `paymentsData?.summary?.totalRevenue`
- Total transactions → `paymentsData?.summary?.totalTransactions`
- Format currency: `'₹' + Number(amount).toLocaleString('en-IN')`
- Transaction table → map `paymentsData?.transactions` to existing table rows:
  - Event title → `t.registration.event.title`
  - Attendee name → `t.registration.user.firstName + ' ' + t.registration.user.lastName`
  - Amount → `'₹' + t.organizerAmount`
  - Date → `new Date(t.paidAt).toLocaleDateString('en-IN')`
  - Status badge → `t.status`

---

## PART 8 — ADD RAZORPAY KEY TO FRONTEND ENV

Add to `eventura/.env.local`:
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_SuVFmBnqnarfMx
```

---

## PART 9 — SEED A PAID EVENT FOR TESTING

Add to `prisma/seed-events.ts` — append after existing seed:

```typescript
// Paid event for testing payments
const paidEvent = await prisma.event.create({
  data: {
    title: 'Full-Stack Development Masterclass',
    description: 'An intensive workshop covering React, Node.js, PostgreSQL and deployment. Certificate provided on completion.',
    collegeId: woxsen.id,
    clubId: club?.id,
    visibility: 'ALL_PLATFORM',
    status: 'PUBLISHED',
    category: 'Workshop',
    format: 'In-Person',
    venue: 'Computer Lab Block B',
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
    maxCapacity: 30,
    ticketPrice: 299,
    isFree: false,
    readinessScore: 88,
    publishedAt: new Date(),
  }
});
console.log('✅ Paid event seeded:', paidEvent.title);
```

Run:
```bash
cd eventura-api && npm run db:seed-events
```

---

## VERIFICATION STEPS

Run all of these. Do not stop until all pass:

**Backend:**
```bash
# 1. TypeScript check
npx tsc --noEmit

# 2. Restart server
npm run dev

# 3. Get token
# Login manually and copy token

# 4. Get paid event ID
curl http://localhost:4000/events | grep -i "masterclass"

# 5. Register for paid event (replace EVENT_ID and TOKEN)
curl -X POST http://localhost:4000/registrations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -H "x-idempotency-key: paid-test-001" \
  -d '{"eventId":"PAID_EVENT_ID"}'

# 6. Create Razorpay order (replace REGISTRATION_ID)
curl -X POST http://localhost:4000/payments/order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"registrationId":"REGISTRATION_ID"}'
```

Step 6 must return `{ success: true, data: { orderId: "order_...", amount: 29900, currency: "INR" } }` ✅

**Frontend:**
1. `npx tsc --noEmit` → 0 errors ✅
2. `npm run dev` → starts with no errors ✅
3. Open `/events` → find "Full-Stack Development Masterclass" ✅
4. Click event → shows "Register — ₹299" button ✅
5. Click register → Razorpay checkout opens ✅
6. Use test card: `4111 1111 1111 1111`, expiry `12/26`, CVV `123` ✅
7. Payment completes → button changes to "✓ Registered — View Ticket" ✅
8. Open `/my-tickets` → ticket shows with PAID status ✅
9. Open `/org/payments` → transaction appears in payout dashboard ✅

---

## FILES ALLOWED TO TOUCH — COMPLETE LIST

**Backend — create new:**
- `src/modules/payments/payments.service.ts`
- `src/modules/payments/payments.controller.ts`
- `src/modules/payments/payments.routes.ts`

**Backend — modify existing:**
- `src/app.ts` — add raw body middleware + payments route registration
- `prisma/seed-events.ts` — append paid event seed

**Frontend — create new:**
- `lib/api/payments.api.ts`
- `lib/hooks/useRazorpay.ts`

**Frontend — modify existing:**
- `app/(attendee)/events/[id]/page.tsx` — wire payment flow
- `app/(organiser)/org/payments/page.tsx` — wire payout dashboard
- `.env.local` — add Razorpay key

**Everything else → DO NOT TOUCH.**
