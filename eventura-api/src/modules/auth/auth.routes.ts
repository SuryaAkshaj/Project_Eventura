import { Router } from 'express';
import { authRateLimiter } from '@middleware/rateLimiter.middleware';
import * as authController from './auth.controller';

const router = Router();

// Strict rate limiting on all auth routes (10 req/min per IP)
router.use(authRateLimiter);

router.post('/signup', authController.signup);
router.post('/verify-email', authController.verifyEmail);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/status', authController.getApprovalStatus);
router.post('/context-switch', authController.contextSwitch);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;
