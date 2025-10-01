import type { Env } from '../types';

const RATE_LIMIT_WINDOW = 3600; // 1 hour in seconds
const MAX_REQUESTS = 5; // Max 5 requests per hour per email

/**
 * Check if request is rate limited
 */
export async function checkRateLimit(
  email: string,
  env: Env
): Promise<{ limited: boolean; remaining: number }> {
  const key = `rate_limit:${email.toLowerCase()}`;
  
  const current = await env.KV.get(key);
  const count = current ? parseInt(current) : 0;
  
  if (count >= MAX_REQUESTS) {
    return { limited: true, remaining: 0 };
  }
  
  return { limited: false, remaining: MAX_REQUESTS - count };
}

/**
 * Increment rate limit counter
 */
export async function incrementRateLimit(
  email: string,
  env: Env
): Promise<void> {
  const key = `rate_limit:${email.toLowerCase()}`;
  
  const current = await env.KV.get(key);
  const count = current ? parseInt(current) : 0;
  const newCount = count + 1;
  
  // Set with TTL of 1 hour
  await env.KV.put(key, newCount.toString(), { expirationTtl: RATE_LIMIT_WINDOW });
}

/**
 * Get rate limit info
 */
export async function getRateLimitInfo(
  email: string,
  env: Env
): Promise<{ requests: number; limit: number; remaining: number }> {
  const key = `rate_limit:${email.toLowerCase()}`;
  const current = await env.KV.get(key);
  const requests = current ? parseInt(current) : 0;
  
  return {
    requests,
    limit: MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - requests)
  };
}

