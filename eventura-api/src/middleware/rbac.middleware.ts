import { Request, Response, NextFunction, RequestHandler } from 'express';
import { RoleName } from '@prisma/client';
import { forbidden } from '@shared/utils/apiResponse';
import { prismaAdmin } from '@config/database';

/**
 * Require user to have at least one of the specified roles.
 *
 * Usage: router.get('/admin', authMiddleware, requireRole('SUPER_ADMIN', 'COLLEGE_ADMIN'), handler)
 */
export function requireRole(...roles: RoleName[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      forbidden(res, 'Authentication required');
      return;
    }

    // JWT uses activeContext.role
    const userRole = req.user.activeContext.role as RoleName;
    if (!roles.includes(userRole)) {
      forbidden(res, `Requires one of: ${roles.join(', ')}. Your role: ${userRole}`);
      return;
    }

    next();
  };
}

/**
 * Require user to have ALL specified permissions in their active context.
 *
 * Usage: router.post('/events', authMiddleware, requirePermission('events:write'), handler)
 */
export function requirePermission(...permissions: string[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      forbidden(res, 'Authentication required');
      return;
    }

    const userPermissions = new Set(req.user.activeContext.permissions);
    const missing = permissions.filter(p => !userPermissions.has(p));

    if (missing.length > 0) {
      forbidden(res, `Missing permissions: ${missing.join(', ')}`);
      return;
    }

    next();
  };
}

/**
 * Validate that an Event Manager has access to the specific event in route params.
 * The event must belong to the Event Manager's college.
 *
 * Usage: router.get('/events/:eventId/scan', authMiddleware, requireEventAccess(), handler)
 */
export function requireEventAccess(): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      forbidden(res, 'Authentication required');
      return;
    }

    const { eventId } = req.params;
    if (!eventId) {
      next();
      return;
    }

    try {
      const event = await prismaAdmin.event.findFirst({
        where: {
          id: eventId,
          collegeId: req.user.activeContext.collegeId,
        },
        select: { id: true },
      });

      if (!event) {
        forbidden(res, 'You do not have access to this event');
        return;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
