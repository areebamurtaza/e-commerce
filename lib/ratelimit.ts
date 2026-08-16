// lib/ratelimit.ts
import { redis } from '@/lib/redis';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

const memoryStore = new Map<string, { count: number; expiresAt: number }>();

/**
 * Sliding window rate limit checker
 * @param identifier Unique rate limit key (e.g., checkout-intent:127.0.0.1)
 * @param limit Maximum requests allowed in window (default: 5)
 * @param windowInSeconds Time window duration in seconds (default: 60)
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 5,
  windowInSeconds: number = 60
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = windowInSeconds * 1000;

  // 1. Upstash Redis execution
  if (redis) {
    try {
      const key = `ratelimit:${identifier}`;
      const pipeline = redis.pipeline();

      pipeline.incr(key);
      pipeline.ttl(key);

      const [countResult, ttlResult] = await pipeline.exec<[number, number]>();
      const count = countResult || 1;
      const ttl = ttlResult && ttlResult > 0 ? ttlResult : windowInSeconds;

      if (count === 1) {
        await redis.expire(key, windowInSeconds);
      }

      const remaining = Math.max(0, limit - count);
      const reset = now + ttl * 1000;

      return {
        success: count <= limit,
        limit,
        remaining,
        reset,
      };
    } catch (err) {
      console.warn('[RATELIMIT_REDIS_FALLBACK]: Falling back to local memory store', err);
    }
  }

  // 2. In-memory sliding window fallback (Localhost)
  const current = memoryStore.get(identifier);

  if (!current || now > current.expiresAt) {
    memoryStore.set(identifier, {
      count: 1,
      expiresAt: now + windowMs,
    });

    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: now + windowMs,
    };
  }

  current.count += 1;
  const remaining = Math.max(0, limit - current.count);

  return {
    success: current.count <= limit,
    limit,
    remaining,
    reset: current.expiresAt,
  };
}