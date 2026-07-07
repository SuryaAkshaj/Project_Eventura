import { Router } from 'express';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireRole } from '@middleware/rbac.middleware';
import { paymentRateLimiter } from '@middleware/rateLimiter.middleware';
import * as paymentsController from './payments.controller';

const router = Router();

// POST /payments/order — create Razorpay order for a registration
router.post('/order', authMiddleware, paymentRateLimiter, paymentsController.createOrder);

// POST /payments/verify — verify payment after checkout (client-side fallback)
router.post('/verify', authMiddleware, paymentsController.verifyPayment);

// POST /payments/webhook — Razorpay webhook (no auth — verified by HMAC signature)
router.post('/webhook', paymentsController.handleWebhook);

// GET /payments/org — organiser payout dashboard
router.get(
  '/org',
  authMiddleware,
  requireRole('COLLEGE_ADMIN', 'CLUB_PRESIDENT'),
  paymentsController.getOrgPayments,
);

// GET /payments/admin — platform-wide payments (Super Admin only)
router.get(
  '/admin',
  authMiddleware,
  requireRole('SUPER_ADMIN'),
  paymentsController.getPlatformPayments,
);

export default router;
