import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware } from '@middleware/auth.middleware';
import { requireRole } from '@middleware/rbac.middleware';
import { asyncHandler } from '@shared/utils/asyncHandler';
import { prismaAdmin } from '@config/database';
import { AppError } from '@shared/errors/AppError';
import * as eventsController from './events.controller';
import * as eventsService from './events.service';


const router = Router();

/**
 * @swagger
 * /events:
 *   get:
 *     tags: [Events]
 *     summary: Browse published events
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *           maximum: 100
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Technical, Cultural, Workshop, Networking, Entrepreneurship]
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *           example: Telangana
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *           enum: [FEST, COMPETITION, WORKSHOP, SEMINAR, OTHER]
 *       - in: query
 *         name: closingSoon
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of events
 */

// ─── Organiser-only routes MUST come before /:id to avoid route param capture ─

// GET /events/org/my-events — all events for my college/club (all statuses)
router.get(
  '/org/my-events',
  authMiddleware,
  requireRole('COLLEGE_ADMIN', 'CLUB_PRESIDENT'),
  eventsController.getOrgEvents,
);

// ─── Open Mode Routes ─────────────────────────────────────────────────────────

// POST /events/open — create event in Open Mode (no college needed)
router.post(
  '/open',
  authMiddleware,
  asyncHandler(async (req, res) => {
    // Verify user is in OPEN mode
    if (req.user!.activeContext.accountMode !== 'OPEN') {
      throw AppError.forbidden('This endpoint is for Open Mode users only');
    }
    const event = await eventsService.createEvent(req.body, {
      ...req.user!.activeContext,
      userId: req.user!.sub,
    });
    return res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully'
    });
  })
);

// GET /events/my-open-events — get Open Mode user's events
router.get(
  '/my-open-events',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const events = await prismaAdmin.event.findMany({
      where: { createdById: req.user!.sub },
      include: {
        _count: { select: { registrations: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: events });
  })
);

// ─── Public / Attendee Routes ─────────────────────────────────────────────────

// GET /events/public/:id — get any published event (no auth needed)
// This is used by the public /e/[id] page
router.get('/public/:id', asyncHandler(async (req, res) => {
  const event = await prismaAdmin.event.findFirst({
    where: {
      id: req.params.id,
      status: 'PUBLISHED',
    },
    include: {
      college: {
        select: { name: true, city: true, state: true, logoUrl: true, slug: true }
      },
      club: { select: { name: true } },
      subEvents: {
        where: { status: 'PUBLISHED' },
        include: { _count: { select: { registrations: true } } },
        orderBy: { startDate: 'asc' },
      },
      _count: { select: { registrations: true, bookmarks: true } },
    }
  });

  if (!event) throw AppError.notFound('Event not found');

  return res.json({ success: true, data: event });
}));

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

// GET /events/:id/sub-events — get sub-events of a fest (public)
router.get('/:id/sub-events', asyncHandler(async (req, res) => {
  const subEvents = await eventsService.getSubEvents(req.params.id);
  return res.json({ success: true, data: subEvents });
}));

// GET /events/:id — get single event detail (auth optional)
router.get('/:id', optionalAuthMiddleware, eventsController.getEventById);

// POST /events/:id/feedback — submit event rating
router.post(
  '/:id/feedback',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { id: eventId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user!.sub;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      throw AppError.badRequest('Rating must be between 1 and 5');
    }

    // Verify user attended the event (must be CHECKED_IN)
    const registration = await prismaAdmin.registration.findFirst({
      where: { eventId, userId, status: 'CHECKED_IN' }
    });

    if (!registration) {
      throw AppError.forbidden('You can only rate events you have attended');
    }

    // Upsert feedback
    const feedback = await prismaAdmin.eventFeedback.upsert({
      where: { eventId_userId: { eventId, userId } },
      update: { rating, comment },
      create: { eventId, userId, rating, comment },
    });

    return res.status(201).json({
      success: true,
      data: feedback,
      message: 'Thank you for your feedback!'
    });
  })
);

// GET /events/:id/feedback — get event ratings summary
router.get('/:id/feedback', asyncHandler(async (req, res) => {
  const { id: eventId } = req.params;

  const feedbacks = await prismaAdmin.eventFeedback.findMany({
    where: { eventId },
    select: { rating: true, comment: true, createdAt: true },
  });

  if (feedbacks.length === 0) {
    return res.json({
      success: true,
      data: { averageRating: null, totalReviews: 0, distribution: {}, reviews: [] }
    });
  }

  const averageRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;

  // Rating distribution: { 5: 10, 4: 8, 3: 3, 2: 1, 1: 0 }
  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  feedbacks.forEach(f => distribution[f.rating]++);

  return res.json({
    success: true,
    data: {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: feedbacks.length,
      distribution,
      reviews: feedbacks.slice(0, 10), // Latest 10 reviews
    }
  });
}));

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
