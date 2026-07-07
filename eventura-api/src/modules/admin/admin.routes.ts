import { Router } from 'express';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireRole } from '@middleware/rbac.middleware';
import { adminRateLimiter } from '@middleware/rateLimiter.middleware';
import * as adminController from './admin.controller';

const router = Router();

// All admin routes require SUPER_ADMIN role
router.use(authMiddleware, requireRole('SUPER_ADMIN'), adminRateLimiter);

// Platform stats
router.get('/stats', adminController.getPlatformStats);

// Colleges
router.get('/colleges', adminController.getAllColleges);
router.get('/colleges/pending', adminController.getPendingColleges);
router.post('/colleges/:id/approve', adminController.approveCollege);
router.post('/colleges/:id/reject', adminController.rejectCollege);
router.post('/colleges/:id/suspend', adminController.suspendCollege);

// Clubs
router.get('/clubs/pending', adminController.getPendingClubs);
router.post('/clubs/:id/approve', adminController.approveClub);
router.post('/clubs/:id/reject', adminController.rejectClub);

// Users
router.get('/users', adminController.getAllUsers);

// Platform settings
router.get('/settings', adminController.getPlatformSettings);
router.patch('/settings', adminController.updatePlatformSettings);

// Audit log
router.get('/audit', adminController.getAuditLog);

// Multi-tenant health
router.get('/health', adminController.getMultiTenantHealth);

// Events
router.get('/events', adminController.getAllEvents);

export default router;
