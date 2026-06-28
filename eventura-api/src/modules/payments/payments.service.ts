import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { prismaAdmin } from '@config/database';
import { env } from '@config/env';
import { AppError } from '@shared/errors/AppError';

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

// ─────────────────────────────────────────────────────────────────────────────
// createOrder — creates or returns a Razorpay order for a pending payment
// ─────────────────────────────────────────────────────────────────────────────
export async function createOrder(registrationId: string, userId: string) {
  // 1. Get registration and verify it belongs to userId
  const registration = await prismaAdmin.registration.findFirst({
    where: { id: registrationId, userId },
    include: {
      event: { select: { title: true, ticketPrice: true, isFree: true } },
      payment: true,
    },
  });

  if (!registration) throw AppError.notFound('Registration not found');
  if (registration.event.isFree) throw AppError.badRequest('This event is free');
  if (!registration.payment) throw AppError.badRequest('No payment record found');

  // 2. If already paid return early
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
    data: { razorpayOrderId: order.id },
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

// ─────────────────────────────────────────────────────────────────────────────
// verifyPayment — client-side payment verification (fallback if webhook is slow)
// ─────────────────────────────────────────────────────────────────────────────
export async function verifyPayment(
  registrationId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  userId: string,
) {
  // 1. Verify HMAC signature
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    throw new AppError('INVALID_SIGNATURE', 'Payment verification failed', 400);
  }

  // 2. Get registration
  const registration = await prismaAdmin.registration.findFirst({
    where: { id: registrationId, userId },
    include: { payment: true },
  });

  if (!registration) throw AppError.notFound('Registration not found');
  if (registration.payment?.status === 'PAID') {
    return { alreadyVerified: true };
  }

  // 3. Use Prisma transaction for idempotent payment confirmation
  const result = await prismaAdmin.$transaction(async (tx) => {
    // Double-check status inside transaction
    const current = await tx.payment.findUnique({ where: { registrationId } });
    if (current?.status === 'PAID') return { alreadyVerified: true };

    // Update payment record
    await tx.payment.update({
      where: { registrationId },
      data: {
        razorpayPaymentId,
        status: 'PAID',
        paidAt: new Date(),
        webhookReceived: false, // Will be updated by webhook if it arrives later
      },
    });

    // Update registration payment status
    await tx.registration.update({
      where: { id: registrationId },
      data: { paymentStatus: 'PAID' },
    });

    return { verified: true };
  });

  // 4. Activate QR in Redis
  const reg = await prismaAdmin.registration.findUnique({
    where: { id: registrationId },
    include: { event: { select: { endDate: true } } },
  });

  if (reg?.qrToken) {
    const ttl = Math.floor((new Date(reg.event.endDate).getTime() - Date.now()) / 1000) + 86400;
    if (ttl > 0) {
      const { redis } = await import('@config/redis');
      await redis.setex(
        `qr:${reg.qrToken}`,
        ttl,
        JSON.stringify({
          registrationId,
          userId,
          eventId: reg.eventId,
          used: false,
        }),
      );
    }
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// handleWebhook — processes Razorpay webhook events
// ─────────────────────────────────────────────────────────────────────────────
export async function handleWebhook(rawBody: string, signature: string) {
  // 1. Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  if (expectedSignature !== signature) {
    throw new AppError('INVALID_SIGNATURE', 'Invalid webhook signature', 400);
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
      if (existing?.status === 'PAID') return; // Already processed (idempotent)

      await tx.payment.update({
        where: { registrationId },
        data: {
          razorpayPaymentId: payment.id,
          status: 'PAID',
          paidAt: new Date(),
          webhookReceived: true,
        },
      });

      await tx.registration.update({
        where: { id: registrationId },
        data: { paymentStatus: 'PAID' },
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
      data: { status: 'FAILED' },
    });
  }

  // 4. Handle refund.processed
  if (eventType === 'refund.processed') {
    const refund = event.payload.refund.entity;
    const razorpayPaymentId = refund.payment_id;

    const payment = await prismaAdmin.payment.findFirst({
      where: { razorpayPaymentId },
    });

    if (payment) {
      await prismaAdmin.payment.update({
        where: { id: payment.id },
        data: { status: 'REFUNDED', refundedAt: new Date() },
      });

      await prismaAdmin.registration.update({
        where: { id: payment.registrationId },
        data: { paymentStatus: 'REFUNDED' },
      });
    }
  }

  return { received: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// getOrgPayments — payment summary for organiser payout dashboard
// ─────────────────────────────────────────────────────────────────────────────
export async function getOrgPayments(collegeId: string) {
  const payments = await prismaAdmin.payment.findMany({
    where: {
      status: 'PAID',
      registration: {
        event: { collegeId },
      },
    },
    include: {
      registration: {
        include: {
          event: { select: { title: true, startDate: true } },
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      },
    },
    orderBy: { paidAt: 'desc' },
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

// ─────────────────────────────────────────────────────────────────────────────
// getPlatformPayments — platform-wide payments for Super Admin
// ─────────────────────────────────────────────────────────────────────────────
export async function getPlatformPayments() {
  const payments = await prismaAdmin.payment.findMany({
    where: { status: 'PAID' },
    include: {
      registration: {
        include: {
          event: {
            select: {
              title: true,
              collegeId: true,
              college: { select: { name: true } },
            },
          },
        },
      },
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
