// lib/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis';

// Sliding window: Max 5 checkout intent creations per 60 seconds per IP/User
export const checkoutRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '60 s'),
  analytics: true,
  prefix: '@shopco/checkout_ratelimit',
});

// Idempotency check: Locks duplicate order creations for 30 seconds
export async function checkIdempotency(key: string): Promise<boolean> {
  if (!process.env.UPSTASH_REDIS_REST_URL) return true;
  // SET key NX EX 30 -> returns 'OK' if key did not exist, null if duplicate
  const result = await redis.set(`idempotency:${key}`, 'LOCKED', {
    nx: true,
    ex: 30,
  });
  return result === 'OK';
}