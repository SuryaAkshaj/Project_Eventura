import { Router } from 'express';
import { authMiddleware } from '@middleware/auth.middleware';
import { asyncHandler } from '@shared/utils/asyncHandler';
import { prismaAdmin } from '@config/database';
import { AppError } from '@shared/errors/AppError';

const router = Router();

// All bookmark routes require auth
router.use(authMiddleware);

// GET /api/v1/bookmarks — get all bookmarks for current user
router.get('/', asyncHandler(async (req, res) => {
  const bookmarks = await prismaAdmin.bookmark.findMany({
    where: { userId: req.user!.sub },
    include: {
      event: {
        include: {
          college: { select: { name: true, city: true, state: true, slug: true } },
          club: { select: { name: true } },
          _count: { select: { registrations: true } },
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  return res.json({ success: true, data: bookmarks });
}));

// POST /api/v1/bookmarks — bookmark an event
router.post('/', asyncHandler(async (req, res) => {
  const { eventId } = req.body;
  if (!eventId) throw AppError.badRequest('eventId is required');

  // Verify event exists
  const event = await prismaAdmin.event.findUnique({ where: { id: eventId } });
  if (!event) throw AppError.notFound('Event not found');

  const bookmark = await prismaAdmin.bookmark.upsert({
    where: { userId_eventId: { userId: req.user!.sub, eventId } },
    update: {},
    create: { userId: req.user!.sub, eventId },
  });

  return res.status(201).json({ success: true, data: bookmark, message: 'Event bookmarked' });
}));

// DELETE /api/v1/bookmarks/:eventId — remove bookmark
router.delete('/:eventId', asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  await prismaAdmin.bookmark.deleteMany({
    where: { userId: req.user!.sub, eventId },
  });

  return res.json({ success: true, message: 'Bookmark removed' });
}));

// GET /api/v1/bookmarks/check/:eventId — check if event is bookmarked
router.get('/check/:eventId', asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const bookmark = await prismaAdmin.bookmark.findUnique({
    where: { userId_eventId: { userId: req.user!.sub, eventId } },
  });

  return res.json({ success: true, data: { bookmarked: !!bookmark } });
}));

export default router;
