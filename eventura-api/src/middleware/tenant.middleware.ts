import { Request, Response, NextFunction } from 'express';
import { prismaAdmin } from '@config/database';
import { logger } from '@shared/utils/logger';

/**
 * Sets PostgreSQL session variables for Row Level Security.
 * Must run AFTER authMiddleware so req.user is available.
 *
 * Sets:
 *   app.current_college_id  — used by all tenant-isolation RLS policies
 *   app.current_user_id     — used by registration isolation policy
 *   app.is_super_admin      — bypasses all RLS when 'true'
 */
export async function tenantMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    return next();
  }

  try {
    const { collegeId, collegeRole } = req.user.activeContext;
    const userId = req.user.sub;
    const isSuperAdmin = collegeRole === 'SUPER_ADMIN';

    // Set PostgreSQL session variables within the current transaction context
    // These variables are read by the RLS policies defined in rls_policies.sql
    await prismaAdmin.$executeRawUnsafe(`
      SELECT
        set_config('app.current_college_id', $1, true),
        set_config('app.current_user_id', $2, true),
        set_config('app.is_super_admin', $3, true)
    `, collegeId, userId, isSuperAdmin ? 'true' : 'false');

    next();
  } catch (err) {
    logger.error('Tenant middleware error:', err);
    next(err);
  }
}
