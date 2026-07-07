import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@config/env';
import { tenantStorage } from '@config/database';
import { isTokenBlacklisted } from '@config/redis';
import { prismaAdmin } from '@config/database';
import { unauthorized } from '@shared/utils/apiResponse';
import { JwtPayload } from '@shared/types/jwt.types';
import { logger } from '@shared/utils/logger';

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Extract Bearer token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      unauthorized(res, 'Missing or malformed Authorization header');
      return;
    }

    const token = authHeader.slice(7);

    // 2. Verify JWT signature
    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        unauthorized(res, 'Token expired');
      } else {
        unauthorized(res, 'Invalid token');
      }
      return;
    }

    // 3. Check Redis blacklist (logout / token rotation)
    if (payload.jti) {
      const blacklisted = await isTokenBlacklisted(payload.jti);
      if (blacklisted) {
        unauthorized(res, 'Token has been revoked');
        return;
      }
    }

    // 4. Check EVENT_MANAGER role expiry in database
    if (payload.activeContext.role === 'EVENT_MANAGER') {
      const assignment = await prismaAdmin.roleAssignment.findFirst({
        where: {
          userId: payload.sub,
          collegeId: payload.activeContext.collegeId ?? undefined,
          status: 'APPROVED',
        },
        select: { expiresAt: true },
      });

      if (assignment?.expiresAt && assignment.expiresAt < new Date()) {
        unauthorized(res, 'Event Manager role has expired');
        return;
      }
    }

    // 5. Attach user to request
    req.user = payload;

    // 5a. Extract request context for audit logging
    req.ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      || req.ip
      || 'unknown';
    req.userAgent = req.headers['user-agent'] || 'unknown';

    // 6. Set AsyncLocalStorage tenant context for Prisma
    const ctx = {
      collegeId: payload.activeContext.collegeId,
      userId: payload.sub,
      role: payload.activeContext.role,
    };

    tenantStorage.run(ctx, () => {
      next();
    });
  } catch (err) {
    logger.error('Auth middleware error:', err);
    next(err);
  }
}

/**
 * Optional auth — attaches user if token present but doesn't reject if missing
 * Used for public routes that show more data when authenticated
 */
export async function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = payload;

    const ctx = {
      collegeId: payload.activeContext.collegeId,
      userId: payload.sub,
      role: payload.activeContext.role,
    };

    tenantStorage.run(ctx, () => next());
  } catch {
    // Token invalid — proceed without user
    next();
  }
}
