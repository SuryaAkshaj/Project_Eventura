import { Router, Request, Response } from 'express';
import { prismaAdmin } from '@config/database';
import { asyncHandler } from '@shared/utils/asyncHandler';
import { success } from '@shared/utils/apiResponse';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireRole } from '@middleware/rbac.middleware';

const router = Router();

// GET /colleges/approved — public, used by signup form
router.get(
  '/approved',
  asyncHandler(async (_req: Request, res: Response) => {
    const colleges = await prismaAdmin.college.findMany({
      where: { approvalStatus: 'APPROVED' },
      select: { id: true, name: true, domain: true },
      orderBy: { name: 'asc' },
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

// GET /colleges/:id/clubs — get approved clubs for a college
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

