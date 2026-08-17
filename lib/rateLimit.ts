/**
 * In-Memory Sliding Window Rate Limiter
 * 
 * NOTE: This is an in-memory rate limiter suitable for single-instance deployments.
 * Before scaling past a single server instance (e.g., multi-region or serverless cluster),
 * migrate this rate limiter to a durable distributed store such as Upstash Redis or Memcached.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const store = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically (every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 3600000); // 1 hour
      if (record.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  const record = store.get(key) || { timestamps: [] };
  // Filter out timestamps outside the sliding window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= limit) {
    const oldestTimestamp = record.timestamps[0];
    const retryAfterMs = oldestTimestamp + windowMs - now;
    const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));

    return {
      success: false,
      limit,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  record.timestamps.push(now);
  store.set(key, record);

  return {
    success: true,
    limit,
    remaining: limit - record.timestamps.length,
    retryAfterSeconds: 0,
  };
}
