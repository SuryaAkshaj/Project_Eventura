import { Router, Request, Response } from 'express';
import { prismaAdmin } from '@config/database';
import { asyncHandler } from '@shared/utils/asyncHandler';
import { success } from '@shared/utils/apiResponse';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireRole } from '@middleware/rbac.middleware';
import { AppError } from '@shared/errors/AppError';

const router = Router();

// GET /colleges/search?q= — public autocomplete, no auth required
router.get(
  '/search',
  asyncHandler(async (req: Request, res: Response) => {
    const query = ((req.query.q as string) || '').trim();

    if (!query || query.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const colleges = await prismaAdmin.college.findMany({
      where: {
        approvalStatus: 'APPROVED',
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
          { type: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        type: true,
        slug: true,
        domain: true,
        logoUrl: true,
      },
      orderBy: [
        { isSeeded: 'desc' }, // Seeded colleges appear first
        { name: 'asc' },
      ],
      take: 10,
    });

    return res.json({ success: true, data: colleges });
  })
);

// GET /colleges/slug/:slug — public, get college page data by slug
router.get(
  '/slug/:slug',
  asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;

    const college = await prismaAdmin.college.findUnique({
      where: { slug },
      include: {
        _count: { select: { events: true, clubs: true } },
        events: {
          where: { status: 'PUBLISHED', visibility: { in: ['ALL_PLATFORM', 'PUBLIC'] } },
          select: {
            id: true,
            title: true,
            startDate: true,
            venue: true,
            isFree: true,
            ticketPrice: true,
            category: true,
            format: true,
          },
          orderBy: { startDate: 'asc' },
          take: 6,
        },
      },
    });

    if (!college) {
      throw AppError.notFound('College not found');
    }

    return res.json({ success: true, data: college });
  })
);

// GET /colleges/approved — public, used by signup form
router.get(
  '/approved',
  asyncHandler(async (_req: Request, res: Response) => {
    const colleges = await prismaAdmin.college.findMany({
      where: { approvalStatus: 'APPROVED' },
      select: {
        id: true,
        name: true,
        domain: true,
        city: true,
        state: true,
        type: true,
        slug: true,
      },
      orderBy: [
        { isSeeded: 'desc' },
        { name: 'asc' },
      ],
    });
    success(res, colleges);
  })
);

// GET /colleges — get all colleges (Super Admin only)
router.get(
  '/',
  authMiddleware,
  requireRole('SUPER_ADMIN'),
  asyncHandler(async (_req: Request, res: Response) => {
    const colleges = await prismaAdmin.college.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { clubs: true, events: true } } },
    });
    return success(res, colleges);
  })
);

// GET /colleges/my-members — get members of organiser's club/college
// Must be defined BEFORE /:id/clubs to avoid route conflict
router.get(
  '/my-members',
  authMiddleware,
  requireRole('COLLEGE_ADMIN', 'CLUB_PRESIDENT'),
  asyncHandler(async (req: Request, res: Response) => {
    const { collegeId, clubId, role } = req.user!.activeContext;
    const cid = collegeId!;

    const where: any = {
      collegeId: cid,
      status: 'APPROVED',
    };

    // Club President sees only their club members; College Admin sees all
    if (role === 'CLUB_PRESIDENT' && clubId) {
      where.clubId = clubId;
    }

    const assignments = await prismaAdmin.roleAssignment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            lastLoginAt: true,
          },
        },
        role: { select: { name: true } },
        club: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const members = assignments.map((a) => ({
      id: a.userId,
      firstName: a.user.firstName,
      lastName: a.user.lastName,
      email: a.user.email,
      avatarUrl: a.user.avatarUrl,
      role: a.role.name,
      clubName: a.club?.name || null,
      lastActive: a.user.lastLoginAt,
      assignmentId: a.id,
      expiresAt: a.expiresAt,
    }));

    return res.json({ success: true, data: members });
  })
);

// POST /colleges/appoint-manager — appoint event manager
router.post(
  '/appoint-manager',
  authMiddleware,
  requireRole('COLLEGE_ADMIN', 'CLUB_PRESIDENT'),
  asyncHandler(async (req: Request, res: Response) => {
    const { userId, eventId } = req.body;
    const { collegeId, clubId } = req.user!.activeContext;

    if (!userId || !eventId) {
      return res.status(400).json({
        success: false,
        error: { message: 'userId and eventId are required' },
      });
    }

    const event = await prismaAdmin.event.findFirst({
      where: { id: eventId, collegeId: collegeId! },
    });
    if (!event) {
      return res.status(404).json({
        success: false,
        error: { message: 'Event not found' },
      });
    }

    const eventManagerRole = await prismaAdmin.role.findUnique({
      where: { name: 'EVENT_MANAGER' },
    });
    if (!eventManagerRole) {
      return res.status(404).json({
        success: false,
        error: { message: 'Event Manager role not found' },
      });
    }

    const resolvedClubId = clubId ?? null;
    const assignment = await prismaAdmin.roleAssignment.upsert({
      where: {
        userId_roleId_collegeId_clubId: {
          userId,
          roleId: eventManagerRole.id,
          collegeId: collegeId!,
          clubId: resolvedClubId as string,
        },
      },
      update: {
        status: 'APPROVED',
        expiresAt: new Date(event.endDate),
      },
      create: {
        userId,
        roleId: eventManagerRole.id,
        collegeId: collegeId!,
        clubId: resolvedClubId,
        status: 'APPROVED',
        expiresAt: new Date(event.endDate),
      },
    });

    await prismaAdmin.auditLog.create({
      data: {
        userId: req.user!.sub,
        action: 'EVENT_MANAGER_APPOINTED',
        details: { appointedUserId: userId, eventId },
      },
    });

    return res.json({
      success: true,
      data: assignment,
      message: 'Event Manager appointed successfully',
    });
  })
);

// GET /colleges/my-org — get current org profile
router.get(
  '/my-org',
  authMiddleware,
  requireRole('COLLEGE_ADMIN', 'CLUB_PRESIDENT'),
  asyncHandler(async (req: Request, res: Response) => {
    const { collegeId, clubId, role } = req.user!.activeContext;
    const cid = collegeId!;

    const college = await prismaAdmin.college.findUnique({
      where: { id: cid },
      select: {
        id: true,
        name: true,
        domain: true,
        logoUrl: true,
        brandingColor: true,
        website: true,
        address: true,
      },
    });

    if (!college) {
      return res.status(404).json({
        success: false,
        error: { message: 'Organisation not found' },
      });
    }

    let club = null;
    if (role === 'CLUB_PRESIDENT' && clubId) {
      club = await prismaAdmin.club.findUnique({
        where: { id: clubId },
        select: { id: true, name: true, description: true, logoUrl: true },
      });
    }

    return res.json({ success: true, data: { college, club } });
  })
);

// PATCH /colleges/my-org — update org profile
router.patch(
  '/my-org',
  authMiddleware,
  requireRole('COLLEGE_ADMIN', 'CLUB_PRESIDENT'),
  asyncHandler(async (req: Request, res: Response) => {
    const { collegeId, clubId, role } = req.user!.activeContext;
    const cid = collegeId!;
    const { website, address, clubName, clubDescription } = req.body;

    // College Admin can update college details (name/domain changes require Super Admin)
    if (role === 'COLLEGE_ADMIN') {
      await prismaAdmin.college.update({
        where: { id: cid },
        data: {
          ...(website !== undefined && { website }),
          ...(address !== undefined && { address }),
        },
      });
    }

    // Club President can update club details
    if (role === 'CLUB_PRESIDENT' && clubId) {
      await prismaAdmin.club.update({
        where: { id: clubId },
        data: {
          ...(clubName && { name: clubName }),
          ...(clubDescription !== undefined && { description: clubDescription }),
        },
      });
    }

    await prismaAdmin.auditLog.create({
      data: {
        userId: req.user!.sub,
        action: 'ORG_SETTINGS_UPDATED',
        details: { collegeId, clubId, changes: req.body },
      },
    });

    return res.json({ success: true, message: 'Settings saved successfully' });
  })
);

// GET /colleges/:id/clubs — get approved clubs for a college
// Must be defined AFTER named routes to avoid conflicts
router.get(
  '/:id/clubs',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const clubs = await prismaAdmin.club.findMany({
      where: {
        collegeId: req.params.id,
        approvalStatus: 'APPROVED',
      },
      orderBy: { name: 'asc' },
    });
    return success(res, clubs);
  })
);

export default router;
