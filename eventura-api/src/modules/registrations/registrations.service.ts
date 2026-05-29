import * as crypto from 'crypto';
import { prismaAdmin } from '@config/database';
import { redis } from '@config/redis';
import { RegisterEventDto } from './registrations.types';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function generateQRToken(userId: string, eventId: string): string {
  const secret = process.env.JWT_SECRET!;
  const payload = `${userId}:${eventId}:${Date.now()}`;
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${Buffer.from(payload).toString('base64url')}.${signature}`;
}

async function checkEventVisibility(event: any, userCollegeId: string): Promise<boolean> {
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

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER FOR EVENT
// ─────────────────────────────────────────────────────────────────────────────

export async function registerForEvent(dto: RegisterEventDto, userId: string, collegeId: string) {
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
  if (!event) {
    const err: any = new Error('Event not found');
    err.code = 'EVENT_NOT_FOUND';
    err.status = 404;
    throw err;
  }
  if (event.status !== 'PUBLISHED') {
    const err: any = new Error('Event is not available for registration');
    err.code = 'EVENT_NOT_PUBLISHED';
    err.status = 400;
    throw err;
  }

  // 3. Check if user already registered — idempotent: return existing instead of throwing
  const alreadyRegistered = await prismaAdmin.registration.findUnique({
    where: { userId_eventId: { userId, eventId: dto.eventId } }
  });
  if (alreadyRegistered && alreadyRegistered.status !== 'CANCELLED') {
    return { ...alreadyRegistered, alreadyRegistered: true };
  }

  // 4. Check visibility — can this user access this event?
  const canAccess = await checkEventVisibility(event, collegeId);
  if (!canAccess) {
    const err: any = new Error('You do not have access to this event');
    err.code = 'EVENT_NOT_ACCESSIBLE';
    err.status = 403;
    throw err;
  }

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

  // 9. Store QR token in Redis for fast validation (TTL = event end date + 24h)
  const ttl = Math.floor((new Date(event.endDate).getTime() - Date.now()) / 1000) + 86400;
  if (ttl > 0) {
    await redis.setex(`qr:${qrToken}`, ttl, JSON.stringify({
      registrationId: registration.id,
      userId,
      eventId: dto.eventId,
      used: false,
    }));
  }

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

// ─────────────────────────────────────────────────────────────────────────────
// GET USER REGISTRATIONS
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// GET REGISTRATION BY ID
// ─────────────────────────────────────────────────────────────────────────────

export async function getRegistrationById(registrationId: string, userId: string) {
  const registration = await prismaAdmin.registration.findUnique({
    where: { id: registrationId },
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
  });

  if (!registration) {
    const err: any = new Error('Registration not found');
    err.code = 'REGISTRATION_NOT_FOUND';
    err.status = 404;
    throw err;
  }
  if (registration.userId !== userId) {
    const err: any = new Error('You do not have access to this registration');
    err.code = 'REGISTRATION_FORBIDDEN';
    err.status = 403;
    throw err;
  }

  return registration;
}

// ─────────────────────────────────────────────────────────────────────────────
// CANCEL REGISTRATION
// ─────────────────────────────────────────────────────────────────────────────

export async function cancelRegistration(registrationId: string, userId: string) {
  const registration = await prismaAdmin.registration.findUnique({
    where: { id: registrationId },
    include: { payment: true }
  });

  if (!registration) {
    const err: any = new Error('Registration not found');
    err.code = 'REGISTRATION_NOT_FOUND';
    err.status = 404;
    throw err;
  }
  if (registration.userId !== userId) {
    const err: any = new Error('You do not have access to this registration');
    err.code = 'REGISTRATION_FORBIDDEN';
    err.status = 403;
    throw err;
  }
  if (registration.status === 'CHECKED_IN') {
    const err: any = new Error('Cannot cancel a checked-in registration');
    err.code = 'REGISTRATION_CHECKED_IN';
    err.status = 409;
    throw err;
  }
  if (registration.status === 'CANCELLED') {
    const err: any = new Error('Registration is already cancelled');
    err.code = 'REGISTRATION_ALREADY_CANCELLED';
    err.status = 409;
    throw err;
  }

  const wasWaitlisted = registration.status === 'WAITLISTED';
  const wasRegistered = registration.status === 'REGISTERED';

  // Update registration to CANCELLED
  const updated = await prismaAdmin.registration.update({
    where: { id: registrationId },
    data: { status: 'CANCELLED' }
  });

  // If was WAITLISTED → delete from Waitlist table, shift positions up
  if (wasWaitlisted) {
    const waitlistEntry = await prismaAdmin.waitlist.findFirst({
      where: { userId, eventId: registration.eventId }
    });
    if (waitlistEntry) {
      await prismaAdmin.waitlist.delete({ where: { id: waitlistEntry.id } });
      // Shift remaining positions up
      await prismaAdmin.$executeRaw`
        UPDATE "Waitlist" SET position = position - 1
        WHERE "eventId" = ${registration.eventId} AND position > ${waitlistEntry.position}
      `;
    }
  }

  // If was REGISTERED and payment was PAID → refund
  if (wasRegistered && registration.payment && registration.payment.status === 'PAID') {
    await prismaAdmin.payment.update({
      where: { id: registration.payment.id },
      data: { status: 'REFUNDED' }
    });
  }

  // If was REGISTERED and there is a waitlist → promote first waitlist entry
  if (wasRegistered) {
    const firstWaiting = await prismaAdmin.waitlist.findFirst({
      where: { eventId: registration.eventId },
      orderBy: { position: 'asc' }
    });
    if (firstWaiting) {
      await prismaAdmin.registration.updateMany({
        where: { userId: firstWaiting.userId, eventId: registration.eventId },
        data: { status: 'REGISTERED' }
      });
      await prismaAdmin.waitlist.delete({ where: { id: firstWaiting.id } });
    }
  }

  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET EVENT ATTENDEES (ORGANISER)
// ─────────────────────────────────────────────────────────────────────────────

export async function getEventAttendees(eventId: string, organizerCollegeId: string) {
  // Verify event belongs to organizerCollegeId
  const event = await prismaAdmin.event.findUnique({
    where: { id: eventId },
    select: { collegeId: true }
  });

  if (!event) {
    const err: any = new Error('Event not found');
    err.code = 'EVENT_NOT_FOUND';
    err.status = 404;
    throw err;
  }
  if (event.collegeId !== organizerCollegeId) {
    const err: any = new Error('You do not have access to this event');
    err.code = 'EVENT_FORBIDDEN';
    err.status = 403;
    throw err;
  }

  return prismaAdmin.registration.findMany({
    where: { eventId, status: { not: 'CANCELLED' } },
    include: {
      user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
      payment: true,
    },
    orderBy: { createdAt: 'asc' }
  });
}
