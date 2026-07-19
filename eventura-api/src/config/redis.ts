import Redis from 'ioredis';
import { env } from './env';
import { logger } from '@shared/utils/logger';

// ─────────────────────────────────────────────────────────────────────────────
// Redis Client Singleton
// ─────────────────────────────────────────────────────────────────────────────
let retryCount = 0;
const MAX_RETRIES = 10;

export const redis = new Redis(env.REDIS_URL, {
  password: env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    retryCount++;
    if (retryCount > MAX_RETRIES) {
      logger.error(`Redis: max retries (${MAX_RETRIES}) exceeded. Giving up.`);
      return null; // stop retrying
    }
    const delay = Math.min(times * 200, 10000); // exponential backoff, max 10s
    logger.warn(`Redis: reconnecting in ${delay}ms (attempt ${times}/${MAX_RETRIES})`);
    return delay;
  },
  enableReadyCheck: true,
  lazyConnect: false,
});

redis.on('connect', () => {
  retryCount = 0;
  logger.info('Redis: connection established');
});

redis.on('ready', () => {
  logger.info('Redis: ready to accept commands');
  // Mission 29: clean up old QR nonce keys (one-time, safe to leave)
  cleanupOldQRNonces();
});

// ─────────────────────────────────────────────────────────────────────────────
// One-time cleanup of legacy QR nonce keys after static QR migration
// ─────────────────────────────────────────────────────────────────────────────
async function cleanupOldQRNonces() {
  try {
    const keys = await redis.keys('nonce:*');
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.info(`Cleaned up ${keys.length} old QR nonce keys`);
    }
  } catch (err) {
    logger.warn('QR nonce cleanup failed (non-critical):', err);
  }
}

redis.on('error', (err) => {
  logger.error('Redis error:', err.message);
});

redis.on('reconnecting', (delay: number) => {
  logger.warn(`Redis: reconnecting in ${delay}ms`);
});

redis.on('close', () => {
  logger.warn('Redis: connection closed');
});

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Set a key with TTL (seconds)
 */
export async function setWithExpiry(key: string, value: string, ttlSeconds: number): Promise<void> {
  await redis.set(key, value, 'EX', ttlSeconds);
}

/**
 * Atomic GET + DEL — used for one-time nonce validation
 * Returns the value if it existed, null otherwise
 */
export async function getAndDelete(key: string): Promise<string | null> {
  const result = await redis.eval(
    `local v = redis.call('GET', KEYS[1])
     if v then redis.call('DEL', KEYS[1]) end
     return v`,
    1,
    key,
  ) as string | null;
  return result;
}

/**
 * Atomic SET if Not Exists — used for idempotency and double-scan prevention
 * Returns true if key was set, false if it already existed
 */
export async function setNX(key: string, value: string, ttlSeconds: number): Promise<boolean> {
  const result = await redis.set(key, value, 'EX', ttlSeconds, 'NX');
  return result === 'OK';
}

/**
 * Check if a JWT is blacklisted (used in auth middleware)
 */
export async function isTokenBlacklisted(jti: string): Promise<boolean> {
  const exists = await redis.exists(`blacklist:${jti}`);
  return exists === 1;
}

/**
 * Blacklist a JWT (on logout or rotation)
 */
export async function blacklistToken(jti: string, ttlSeconds: number): Promise<void> {
  await setWithExpiry(`blacklist:${jti}`, '1', ttlSeconds);
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await redis.quit();
});
