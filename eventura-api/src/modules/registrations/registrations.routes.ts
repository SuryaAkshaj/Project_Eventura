import { Router } from 'express';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireRole } from '@middleware/rbac.middleware';
import * as registrationsController from './registrations.controller';

const router = Router();

// Attendee routes
router.post('/', authMiddleware, registrationsController.registerForEvent);
router.get('/my', authMiddleware, registrationsController.getMyRegistrations);
router.get('/my/:id', authMiddleware, registrationsController.getRegistrationById);
router.post('/my/:id/cancel', authMiddleware, registrationsController.cancelRegistration);

// Organiser routes
router.get(
  '/event/:eventId',
  authMiddleware,
  requireRole('COLLEGE_ADMIN', 'CLUB_PRESIDENT', 'EVENT_MANAGER'),
  registrationsController.getEventAttendees
);

export default router;
