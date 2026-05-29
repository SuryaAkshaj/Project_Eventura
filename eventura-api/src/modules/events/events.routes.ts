import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware } from '@middleware/auth.middleware';
import { requireRole } from '@middleware/rbac.middleware';
import * as eventsController from './events.controller';

const router = Router();

// ─── Organiser-only routes MUST come before /:id to avoid route param capture ─

// GET /events/org/my-events — all events for my college/club (all statuses)
router.get(
  '/org/my-events',
  authMiddleware,
  requireRole('COLLEGE_ADMIN', 'CLUB_PRESIDENT'),
  eventsController.getOrgEvents,
);

// ─── Public / Attendee Routes ─────────────────────────────────────────────────

// GET /events — browse all visible events (auth optional for better visibility)
router.get('/', optionalAuthMiddleware, eventsController.getEvents);

// ─── Organiser Routes with :id params ─────────────────────────────────────────

// POST /events — create new event
router.post(
  '/',
  authMiddleware,
  requireRole('COLLEGE_ADMIN', 'CLUB_PRESIDENT'),
  eventsController.createEvent,
);

// GET /events/:id/readiness — get readiness score (before /:id to avoid ambiguity)
router.get(
  '/:id/readiness',
  authMiddleware,
  requireRole('COLLEGE_ADMIN', 'CLUB_PRESIDENT'),
  eventsController.getReadinessScore,
);

// GET /events/:id/stats — get live event stats
router.get(
  '/:id/stats',
  authMiddleware,
  requireRole('COLLEGE_ADMIN', 'CLUB_PRESIDENT', 'EVENT_MANAGER'),
  eventsController.getEventStats,
);

// GET /events/:id — get single event detail (auth optional)
router.get('/:id', optionalAuthMiddleware, eventsController.getEventById);

// PATCH /events/:id — update event
router.patch(
  '/:id',
  authMiddleware,
  requireRole('COLLEGE_ADMIN', 'CLUB_PRESIDENT'),
  eventsController.updateEvent,
);

// POST /events/:id/publish — publish event
router.post(
  '/:id/publish',
  authMiddleware,
  requireRole('COLLEGE_ADMIN', 'CLUB_PRESIDENT'),
  eventsController.publishEvent,
);

// POST /events/:id/cancel — cancel event
router.post(
  '/:id/cancel',
  authMiddleware,
  requireRole('COLLEGE_ADMIN', 'CLUB_PRESIDENT'),
  eventsController.cancelEvent,
);

// DELETE /events/:id — delete draft event
router.delete(
  '/:id',
  authMiddleware,
  requireRole('COLLEGE_ADMIN', 'CLUB_PRESIDENT'),
  eventsController.deleteEvent,
);

export default router;
