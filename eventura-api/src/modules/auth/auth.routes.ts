import { Router } from 'express';
import { authRateLimiter, sessionRateLimiter } from '@middleware/rateLimiter.middleware';
import { authMiddleware } from '@middleware/auth.middleware';
import * as authController from './auth.controller';

const router = Router();

// ── Session management — relaxed limit (60/min) ──────────────────────────────
// These are called on every page load by AuthInitializer, not brute-force targets.
router.post('/refresh', sessionRateLimiter, authController.refreshToken);
router.get('/me', sessionRateLimiter, authMiddleware, authController.getMe);

// ── Sensitive auth endpoints — strict limit (10/min) ─────────────────────────
// Brute-force sensitive: login, signup, OTP verification, password reset.
router.post('/signup', authRateLimiter, authController.signup);
router.post('/verify-email', authRateLimiter, authController.verifyEmail);
router.post('/login', authRateLimiter, authController.login);
router.post('/logout', authRateLimiter, authController.logout);
router.get('/status', authRateLimiter, authController.getApprovalStatus);
router.post('/context-switch', authRateLimiter, authController.contextSwitch);
router.post('/forgot-password', authRateLimiter, authController.forgotPassword);
router.post('/reset-password', authRateLimiter, authController.resetPassword);

export default router;
