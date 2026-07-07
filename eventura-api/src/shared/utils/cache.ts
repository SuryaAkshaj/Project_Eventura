import { redis } from '@config/redis';
import { logger } from '@shared/utils/logger';

export const CACHE_TTL = {
  EVENT_LIST:     60,    // 1 minute
  EVENT_DETAIL:   30,    // 30 seconds
  COLLEGE_LIST:   300,   // 5 minutes
  PLATFORM_STATS: 120,   // 2 minutes
  USER_PROFILE:   60,    // 1 minute
} as const;

export const CacheKeys = {
  eventList: (collegeId: string, page: number, filters: string) =>
    `cache:events:list:${collegeId}:${page}:${filters}`,
  eventDetail: (eventId: string) =>
    `cache:events:detail:${eventId}`,
  collegeList: () =>
    `cache:colleges:list`,
  platformStats: () =>
    `cache:admin:stats`,
};

export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
  options: { skipCache?: boolean } = {}
): Promise<T> {
  if (options.skipCache) return fetcher();

  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached) as T;
  } catch (err) {
    logger.warn('Cache read error (falling through to DB):', err);
  }

  const data = await fetcher();

  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  } catch (err) {
    logger.warn('Cache write error:', err);
  }

  return data;
}

export async function invalidateEventListCache(collegeId: string): Promise<void> {
  try {
    const keys = await redis.keys(`cache:events:list:${collegeId}:*`);
    if (keys.length > 0) await redis.del(...keys);
  } catch (err) {
    logger.warn('Cache invalidation error:', err);
  }
}

export async function invalidateEventCache(eventId: string): Promise<void> {
  try {
    await redis.del(CacheKeys.eventDetail(eventId));
  } catch (err) {
    logger.warn('Cache invalidation error:', err);
  }
}

export async function invalidatePlatformStats(): Promise<void> {
  try {
    await redis.del(CacheKeys.platformStats());
  } catch (err) {
    logger.warn('Cache invalidation error:', err);
  }
}
