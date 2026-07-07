import { Router, Request, Response } from 'express';
import { prismaAdmin } from '@config/database';
import { redis } from '@config/redis';

const router = Router();

/**
 * GET /health
 * Public endpoint — no authentication required.
 * Used by Docker health checks, Railway, and monitoring tools.
 */
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const start = Date.now();
  const checks: Record<string, string> = {};

  // PostgreSQL check
  try {
    await prismaAdmin.$queryRaw`SELECT 1`;
    checks.database = 'connected';
  } catch {
    checks.database = 'error';
  }

  // Redis check
  try {
    await redis.ping();
    checks.redis = 'connected';
  } catch {
    checks.redis = 'error';
  }

  checks.pgbouncer = checks.database === 'connected' ? 'connected' : 'error';

  const allHealthy = Object.values(checks).every(v => v === 'connected');
  const responseTime = Date.now() - start;

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ok' : 'degraded',
    services: checks,
    uptime: Math.floor(process.uptime()),
    responseTime: `${responseTime}ms`,
    version: process.env.npm_package_version ?? '1.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

export default router;
