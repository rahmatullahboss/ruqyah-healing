/**
 * Simple in-memory rate limiter for Cloudflare Workers.
 * Uses a Map with sliding window counters.
 * Note: Each Worker isolate has its own memory, so this is per-isolate.
 * For distributed rate limiting, use Cloudflare KV or Durable Objects.
 */

const store = new Map();

const CLEANUP_INTERVAL = 60_000; // 1 minute
let lastCleanup = Date.now();

function cleanup(windowMs) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now - entry.resetTime > windowMs * 2) {
      store.delete(key);
    }
  }
}

/**
 * Check if a request should be rate limited.
 * @param {string} key - Unique key (e.g., IP + endpoint)
 * @param {number} maxRequests - Max requests per window
 * @param {number} windowMs - Window size in ms
 * @returns {{ limited: boolean, remaining: number, resetIn: number }}
 */
export function checkRateLimit(key, maxRequests, windowMs) {
  cleanup(windowMs);
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    store.set(key, { count: 1, resetTime: now + windowMs });
    return { limited: false, remaining: maxRequests - 1, resetIn: windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, maxRequests - entry.count);
  const resetIn = entry.resetTime - now;

  if (entry.count > maxRequests) {
    return { limited: true, remaining: 0, resetIn };
  }

  return { limited: false, remaining, resetIn };
}

/**
 * Get client IP from Cloudflare request headers.
 */
export function getClientIp(request) {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

// Rate limit configurations per endpoint category
export const RATE_LIMITS = {
  auth: { maxRequests: 5, windowMs: 15 * 60 * 1000 },     // 5 per 15 min
  chat: { maxRequests: 20, windowMs: 60 * 1000 },          // 20 per min
  appointment: { maxRequests: 3, windowMs: 10 * 60 * 1000 }, // 3 per 10 min
  admin: { maxRequests: 30, windowMs: 60 * 1000 },          // 30 per min
};
