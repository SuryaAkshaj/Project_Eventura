import { Request, Response, NextFunction, RequestHandler } from 'express';
import { redis } from '@config/redis';
import { logger } from '@shared/utils/logger';

interface RateLimiterOptions {
  windowSeconds: number;
  maxRequests: number;
  keyPrefix: string;
  keyExtractor: (req: Request) => string;
}

const getIp = (req: Request): string =>
  (req.headers['x-forwarded-for'] as string)
    ?.split(',')[0]?.trim() || req.ip || 'unknown';

/**
 * TRUE sliding window rate limiter using Redis sorted sets.
 * Accurate across window boundaries — no edge case exploits.
 */
function createRateLimiter(options: RateLimiterOptions): RequestHandler {
  const { windowSeconds, maxRequests, keyPrefix, keyExtractor } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = keyExtractor(req);
      const key = `ratelimit:${keyPrefix}:${identifier}`;
      const now = Date.now();
      const windowMs = windowSeconds * 1000;
      const uniqueMember = `${now}-${Math.random()}`;

      // Atomic sliding window via pipeline:
      // 1. Remove entries outside the window
      // 2. Add current request
      // 3. Count requests in window
      // 4. Set expiry
      const pipeline = redis.pipeline();
      pipeline.zremrangebyscore(key, 0, now - windowMs);
      pipeline.zadd(key, now, uniqueMember);
      pipeline.zcard(key);
      pipeline.expire(key, windowSeconds);
      const results = await pipeline.exec();

      const count = results?.[2]?.[1] as number ?? 0;
      const remaining = Math.max(0, maxRequests - count);
      const resetAt = Math.floor((now + windowMs) / 1000);

      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', resetAt);
      res.setHeader('X-RateLimit-Policy', `${maxRequests};w=${windowSeconds};sliding`);

      if (count > maxRequests) {
        res.setHeader('Retry-After', windowSeconds);
        res.status(429).json({
          success: false,
          error: {
            code: 'TOO_MANY_REQUESTS',
            message: `Rate limit exceeded. Try again in ${windowSeconds} seconds.`,
          }
        });
        return;
      }

      next();
    } catch (err) {
      // Redis down — fail open (never block all traffic)
      logger.error('Rate limiter error (failing open):', err);
      next();
    }
  };
}

// ─── Exported Rate Limiters ───────────────────────────────────────────────

/** General API — 100 req/min per IP */
export const generalRateLimiter = createRateLimiter({
  windowSeconds: 60,
  maxRequests: 100,
  keyPrefix: 'api',
  keyExtractor: getIp,
});

/** Auth endpoints — 10 req/min per IP */
export const authRateLimiter = createRateLimiter({
  windowSeconds: 60,
  maxRequests: 10,
  keyPrefix: 'auth',
  keyExtractor: getIp,
});

/**
 * Login — 5 attempts / 15 min per EMAIL
 * Scoped per email to prevent distributed brute force
 * (attacker using 100 IPs to crack one account)
 */
export const loginRateLimiter = createRateLimiter({
  windowSeconds: 900,
  maxRequests: 5,
  keyPrefix: 'login',
  keyExtractor: (req) =>
    req.body?.email?.toLowerCase().trim() || getIp(req),
});

/** Forgot password — 3 req/hour per email */
export const forgotPasswordRateLimiter = createRateLimiter({
  windowSeconds: 3600,
  maxRequests: 3,
  keyPrefix: 'forgot',
  keyExtractor: (req) =>
    req.body?.email?.toLowerCase().trim() || getIp(req),
});

/** OTP verification — 5 attempts/hour per email */
export const otpRateLimiter = createRateLimiter({
  windowSeconds: 3600,
  maxRequests: 5,
  keyPrefix: 'otp',
  keyExtractor: (req) =>
    req.body?.email?.toLowerCase().trim() || getIp(req),
});

/** Session endpoints (me, refresh) — 60/min per IP */
export const sessionRateLimiter = createRateLimiter({
  windowSeconds: 60,
  maxRequests: 60,
  keyPrefix: 'session',
  keyExtractor: getIp,
});

/** QR scan — 60 scans/min per Event Manager userId */
export const scanRateLimiter = createRateLimiter({
  windowSeconds: 60,
  maxRequests: 60,
  keyPrefix: 'scan',
  keyExtractor: (req) => (req as any).user?.sub ?? getIp(req),
});

/** Payment order creation — 10/min per userId */
export const paymentRateLimiter = createRateLimiter({
  windowSeconds: 60,
  maxRequests: 10,
  keyPrefix: 'payment',
  keyExtractor: (req) => (req as any).user?.sub ?? getIp(req),
});

/** Bulk certificate generation — 5/hour per userId */
export const bulkCertRateLimiter = createRateLimiter({
  windowSeconds: 3600,
  maxRequests: 5,
  keyPrefix: 'cert:bulk',
  keyExtractor: (req) => (req as any).user?.sub ?? getIp(req),
});

/** Admin endpoints — 500/min per adminId */
export const adminRateLimiter = createRateLimiter({
  windowSeconds: 60,
  maxRequests: 500,
  keyPrefix: 'admin',
  keyExtractor: (req) => (req as any).user?.sub ?? getIp(req),
});
