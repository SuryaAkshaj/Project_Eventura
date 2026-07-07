import { Router } from 'express';
import {
  loginRateLimiter,
  authRateLimiter,
  otpRateLimiter,
  forgotPasswordRateLimiter,
  sessionRateLimiter,
} from '@middleware/rateLimiter.middleware';
import { authMiddleware } from '@middleware/auth.middleware';
import * as authController from './auth.controller';

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: test@woxsen.edu.in
 *               password:
 *                 type: string
 *                 example: Test@1234
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     user:
 *                       type: object
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many login attempts
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */

// ── Session management — relaxed limit (60/min) ──────────────────────────────
// These are called on every page load by AuthInitializer, not brute-force targets.
router.post('/refresh', sessionRateLimiter, authController.refreshToken);
router.get('/me', sessionRateLimiter, authMiddleware, authController.getMe);

// ── Sensitive auth endpoints — granular per-action limits ────────────────────
router.post('/login',           loginRateLimiter,           authController.login);
router.post('/signup',          authRateLimiter,             authController.signup);
router.post('/verify-email',    otpRateLimiter,              authController.verifyEmail);
router.post('/forgot-password', forgotPasswordRateLimiter,   authController.forgotPassword);
router.post('/reset-password',  otpRateLimiter,              authController.resetPassword);
router.post('/logout',          authRateLimiter,             authController.logout);
router.get('/status',           authRateLimiter,             authController.getApprovalStatus);
router.post('/context-switch',  authRateLimiter,             authController.contextSwitch);

export default router;
