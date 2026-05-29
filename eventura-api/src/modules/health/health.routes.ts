import { Router, Request, Response } from 'express';
import { prismaAdmin } from '@config/database';
import { redis } from '@config/redis';
import { Client } from 'pg';
import { env } from '@config/env';

const router = Router();

/**
 * GET /health
 * Public endpoint — no authentication required.
 * Used by Docker health checks, Railway, and monitoring tools.
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const services: Record<string, 'connected' | 'error'> = {
    database: 'error',
    redis: 'error',
    pgbouncer: 'error',
  };

  // 1. Check PostgreSQL (via direct URL)
  try {
    await prismaAdmin.$queryRaw`SELECT 1`;
    services.database = 'connected';
  } catch {
    services.database = 'error';
  }

  // 2. Check Redis
  try {
    const pong = await redis.ping();
    services.redis = pong === 'PONG' ? 'connected' : 'error';
  } catch {
    services.redis = 'error';
  }

  // 3. Check PgBouncer (separate connection on port 6432)
  const pgbouncerClient = new Client({
    connectionString: env.DATABASE_URL, // PgBouncer URL (port 6432)
    connectionTimeoutMillis: 3000,
  });

  try {
    await pgbouncerClient.connect();
    await pgbouncerClient.query('SELECT 1');
    services.pgbouncer = 'connected';
    await pgbouncerClient.end();
  } catch {
    services.pgbouncer = 'error';
    try { await pgbouncerClient.end(); } catch { /* ignore */ }
  }

  const allHealthy = Object.values(services).every(s => s === 'connected');
  const statusCode = allHealthy ? 200 : 503;

  res.status(statusCode).json({
    status: allHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    services,
    version: '1.0.0',
  });
});

export default router;
