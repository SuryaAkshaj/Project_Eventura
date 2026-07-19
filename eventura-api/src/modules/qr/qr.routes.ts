import { Router } from 'express';
import { authMiddleware } from '@middleware/auth.middleware';
import { scanRateLimiter } from '@middleware/rateLimiter.middleware';
import { asyncHandler } from '@shared/utils/asyncHandler';
import { success, error as apiError } from '@shared/utils/apiResponse';
import { prismaAdmin } from '@config/database';
import { redis } from '@config/redis';
import { env } from '@config/env';
import * as crypto from 'crypto';

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// Static HMAC QR token — deterministic, no nonce, works offline
// ─────────────────────────────────────────────────────────────────────────────
function generateStaticQRToken(registrationId: string, userId: string): string {
  return crypto
    .createHmac('sha256', env.JWT_SECRET)
    .update(`${registrationId}:${userId}`)
    .digest('hex');
}

// GET /qr/:registrationId — get QR data for a registration (attendee's own ticket)
router.get('/:registrationId', authMiddleware, asyncHandler(async (req, res) => {
  const { registrationId } = req.params;
  const userId = req.user!.sub;

  const registration = await prismaAdmin.registration.findFirst({
    where: {
      id: registrationId,
      userId,  // Can only get your own QR
    },
    include: {
      event: {
        select: { title: true, startDate: true, endDate: true, venue: true, status: true }
      }
    }
  });

  if (!registration) {
    return apiError(res, 'REGISTRATION_NOT_FOUND', 'Registration not found', undefined, 404);
  }

  if (registration.status === 'CANCELLED') {
    return apiError(res, 'REGISTRATION_CANCELLED', 'This registration has been cancelled', undefined, 400);
  }

  if (registration.paymentStatus === 'PENDING') {
    return apiError(res, 'PAYMENT_PENDING', 'Complete payment to access QR code', undefined, 402);
  }

  // Generate static QR token (no nonce, no Redis, works offline)
  const qrToken = generateStaticQRToken(registrationId, userId);

  // QR value encodes: registrationId|qrToken
  // Scanner validates by recomputing the HMAC
  const qrValue = `${registrationId}|${qrToken}`;

  return success(res, {
    qrValue,           // This is what the QR code displays
    qrToken,
    registrationId: registration.id,
    eventTitle: registration.event.title,
    eventDate: registration.event.startDate,
    venue: registration.event.venue,
    status: registration.status,
    // No nonce, no expiresAt — QR is permanent
  });
}));

// POST /qr/validate — validate a QR scan (Event Manager only)
router.post('/validate', authMiddleware, scanRateLimiter, asyncHandler(async (req, res) => {
  const { qrValue, eventId } = req.body;

  if (!qrValue || !eventId) {
    return apiError(res, 'INVALID_REQUEST', 'qrValue and eventId are required', undefined, 400);
  }

  // Parse QR value: "registrationId|qrToken"
  const parts = qrValue.split('|');
  if (parts.length !== 2) {
    return success(res, { result: 'INVALID', message: 'Invalid QR code format' });
  }

  const [registrationId, providedToken] = parts;

  // 1. Fetch registration from DB
  const registration = await prismaAdmin.registration.findFirst({
    where: { id: registrationId, eventId },
    include: {
      user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } }
    }
  });

  if (!registration) {
    return success(res, { result: 'INVALID', message: 'QR code not found for this event' });
  }

  // 2. Verify HMAC signature
  const expectedToken = crypto
    .createHmac('sha256', env.JWT_SECRET)
    .update(`${registrationId}:${registration.userId}`)
    .digest('hex');

  if (providedToken !== expectedToken) {
    return success(res, { result: 'INVALID', message: 'QR code signature invalid' });
  }

  // 3. Check if already checked in
  if (registration.status === 'CHECKED_IN') {
    return success(res, {
      result: 'DUPLICATE',
      message: 'Already checked in',
      checkedInAt: registration.checkedInAt,
      attendee: registration.user,
    });
  }

  // 4. Check if cancelled
  if (registration.status !== 'REGISTERED') {
    return success(res, { result: 'INVALID', message: `Registration status: ${registration.status}` });
  }

  // 5. Check payment status for paid events
  if (registration.paymentStatus === 'PENDING') {
    return success(res, { result: 'PAYMENT_PENDING', message: 'Payment not completed' });
  }

  // 6. Atomic Redis SETNX to prevent double-scan race condition
  const lockKey = `checkin-lock:${registrationId}`;
  const lockAcquired = await redis.set(lockKey, '1', 'EX', 30, 'NX');

  if (!lockAcquired) {
    return success(res, { result: 'DUPLICATE', message: 'Check-in already in progress' });
  }

  try {
    // 7. Mark as checked in using Prisma transaction (idempotent upsert pattern)
    const updated = await prismaAdmin.$transaction(async (tx) => {
      const current = await tx.registration.findUnique({ where: { id: registration.id } });
      if (current?.status === 'CHECKED_IN') return current;

      return tx.registration.update({
        where: { id: registration.id },
        data: { status: 'CHECKED_IN', checkedInAt: new Date() }
      });
    });

    // 8. Log scan
    await prismaAdmin.scanLog.create({
      data: {
        registrationId: registration.id,
        scannedBy: req.user!.sub,
        result: 'SUCCESS',
        ipAddress: req.ip,
      }
    });

    return success(res, {
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
