import { Request, Response, NextFunction, RequestHandler } from 'express';
import { redis } from '@config/redis';
import { tooManyRequests } from '@shared/utils/apiResponse';
import { logger } from '@shared/utils/logger';

interface RateLimiterOptions {
  windowSeconds: number;
  maxRequests: number;
  keyPrefix: string;
  keyExtractor: (req: Request) => string;
}

/**
 * Redis sliding window rate limiter factory
 */
function createRateLimiter(options: RateLimiterOptions): RequestHandler {
  const { windowSeconds, maxRequests, keyPrefix, keyExtractor } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = keyExtractor(req);
      const key = `ratelimit:${keyPrefix}:${identifier}`;

      const current = await redis.incr(key);

      if (current === 1) {
        // First request — set expiry
        await redis.expire(key, windowSeconds);
      }

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current));
      res.setHeader('X-RateLimit-Reset', Math.floor(Date.now() / 1000) + windowSeconds);

      if (current > maxRequests) {
        tooManyRequests(res, windowSeconds);
        return;
      }

      next();
    } catch (err) {
      // If Redis is down, fail open (don't block all traffic)
      logger.error('Rate limiter error (failing open):', err);
      next();
    }
  };
}

const getIp = (req: Request): string =>
  (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown';

/**
 * General API rate limiter — 100 requests per minute per IP
 */
export const generalRateLimiter = createRateLimiter({
  windowSeconds: 60,
  maxRequests: 100,
  keyPrefix: 'api',
  keyExtractor: getIp,
});

/**
 * Auth endpoint rate limiter — 10 requests per minute per IP (brute-force prevention)
 */
export const authRateLimiter = createRateLimiter({
  windowSeconds: 60,
  maxRequests: 10,
  keyPrefix: 'auth',
  keyExtractor: getIp,
});

/**
 * Session endpoint rate limiter — 60 requests per minute per IP.
 * Used for /auth/me and /auth/refresh which are called on every page load.
 */
export const sessionRateLimiter = createRateLimiter({
  windowSeconds: 60,
  maxRequests: 60,
  keyPrefix: 'session',
  keyExtractor: getIp,
});

/**
 * QR scan rate limiter — 30 scans per minute per Event Manager user ID
 */
export const scanRateLimiter = createRateLimiter({
  windowSeconds: 60,
  maxRequests: 30,
  keyPrefix: 'scan',
  keyExtractor: (req) => (req as Request & { user?: { sub: string } }).user?.sub ?? getIp(req),
});
