import { Router } from 'express';
import { authMiddleware } from '@middleware/auth.middleware';
import { asyncHandler } from '@shared/utils/asyncHandler';
import { success, error as apiError } from '@shared/utils/apiResponse';
import { prismaAdmin } from '@config/database';
import { redis } from '@config/redis';
import * as crypto from 'crypto';

const router = Router();

// GET /qr/:registrationId — get QR data for a registration (attendee's own ticket)
router.get('/:registrationId', authMiddleware, asyncHandler(async (req, res) => {
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
    return apiError(res, 'REGISTRATION_NOT_FOUND', 'Registration not found', undefined, 404);
  }

  if (registration.status === 'CANCELLED') {
    return apiError(res, 'REGISTRATION_CANCELLED', 'This registration has been cancelled', undefined, 400);
  }

  if (registration.paymentStatus === 'PENDING') {
    return apiError(res, 'PAYMENT_PENDING', 'Complete payment to access QR code', undefined, 402);
  }

  // Generate rotating nonce (refresh every 60 seconds)
  const nonceKey = `nonce:${registration.id}`;
  let nonce = await redis.get(nonceKey);
  if (!nonce) {
    nonce = crypto.randomBytes(16).toString('hex');
    await redis.setex(nonceKey, 60, nonce);
  }

  return success(res, {
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
router.post('/validate', authMiddleware, asyncHandler(async (req, res) => {
  const { qrToken, eventId } = req.body;

  if (!qrToken || !eventId) {
    return apiError(res, 'INVALID_REQUEST', 'qrToken and eventId are required', undefined, 400);
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
      return success(res, { result: 'INVALID', message: 'Invalid QR code' });
    }

    // Continue with DB data
    if (registration.eventId !== eventId) {
      return success(res, { result: 'INVALID', message: 'QR code is for a different event' });
    }

    if (registration.status === 'CHECKED_IN') {
      return success(res, {
        result: 'DUPLICATE',
        message: 'Already checked in',
        checkedInAt: registration.checkedInAt,
        attendee: registration.user,
      });
    }

    if (registration.status !== 'REGISTERED') {
      return success(res, { result: 'INVALID', message: `Registration status: ${registration.status}` });
    }

    if (registration.paymentStatus === 'PENDING') {
      return success(res, { result: 'PAYMENT_PENDING', message: 'Payment not completed' });
    }
  }

  // 2. Atomic Redis SETNX to prevent double-scan race condition
  const lockKey = `checkin-lock:${qrToken}`;
  const lockAcquired = await redis.set(lockKey, '1', 'EX', 30, 'NX');

  if (!lockAcquired) {
    return success(res, { result: 'DUPLICATE', message: 'Check-in already in progress' });
  }

  try {
    // 3. Get registration from DB for final check
    const registration = await prismaAdmin.registration.findFirst({
      where: { qrToken },
      include: { user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } } }
    });

    if (!registration || registration.eventId !== eventId) {
      return success(res, { result: 'INVALID', message: 'Invalid QR code' });
    }

    if (registration.status === 'CHECKED_IN') {
      return success(res, {
        result: 'DUPLICATE',
        message: 'Already checked in',
        checkedInAt: registration.checkedInAt,
        attendee: registration.user,
      });
    }

    if (registration.paymentStatus === 'PENDING') {
      return success(res, { result: 'PAYMENT_PENDING', message: 'Payment not completed' });
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
