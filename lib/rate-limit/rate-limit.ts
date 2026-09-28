import { redis } from "@/lib/redis/redis";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
};

export interface RateLimiter {
  consume(key: string, limit: number, windowMs: number): Promise<RateLimitResult>;
}

// ─── In-Memory fallback (used when Redis is unavailable) ─────────────────────
type Bucket = {
  count: number;
  resetAt: number;
};

export class InMemoryRateLimiter implements RateLimiter {
  private readonly buckets: Map<string, Bucket>;

  constructor(buckets?: Map<string, Bucket>) {
    this.buckets = buckets ?? new Map<string, Bucket>();
  }

  async consume(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    const existing = this.buckets.get(key);
    const bucket =
      existing && existing.resetAt > now
        ? existing
        : {
            count: 0,
            resetAt: now + windowMs
          };

    bucket.count += 1;
    this.buckets.set(key, bucket);

    return {
      allowed: bucket.count <= limit,
      remaining: Math.max(0, limit - bucket.count),
      resetAt: new Date(bucket.resetAt)
    };
  }
}

// ─── Redis sliding-window rate limiter ───────────────────────────────────────
// Uses a Lua script for atomicity: increments a counter and sets TTL in one
// round-trip, so there are no race conditions across instances.
const SLIDING_WINDOW_LUA = `
local key    = KEYS[1]
local limit  = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local now    = tonumber(ARGV[3])
local count  = redis.call("INCR", key)
if count == 1 then
  redis.call("PEXPIRE", key, window)
end
local ttl = redis.call("PTTL", key)
return { count, ttl }
`;

class RedisRateLimiter implements RateLimiter {
  async consume(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    if (!redis) return inMemoryFallback.consume(key, limit, windowMs);

    try {
      const result = await redis.eval(
        SLIDING_WINDOW_LUA,
        1,
        `rl:${key}`,
        String(limit),
        String(windowMs),
        String(Date.now())
      ) as [number, number];

      const count  = result[0];
      const ttlMs  = result[1] > 0 ? result[1] : windowMs;
      const resetAt = new Date(Date.now() + ttlMs);

      return {
        allowed: count <= limit,
        remaining: Math.max(0, limit - count),
        resetAt
      };
    } catch (err) {
      // Redis error — degrade gracefully to in-memory
      console.error("[rate-limit] Redis error, falling back to in-memory:", (err as Error).message);
      return inMemoryFallback.consume(key, limit, windowMs);
    }
  }
}

// ─── Globals (survive HMR in dev) ────────────────────────────────────────────
const GLOBAL_KEY = Symbol.for("elaris.rateLimiterBuckets");
type RateLimiterGlobal = typeof globalThis & { [GLOBAL_KEY]?: Map<string, Bucket> };

const g = globalThis as RateLimiterGlobal;
if (!g[GLOBAL_KEY]) {
  g[GLOBAL_KEY] = new Map<string, Bucket>();
}

const inMemoryFallback: RateLimiter = new InMemoryRateLimiter(g[GLOBAL_KEY]!);

// Export: uses Redis when available, in-memory when not
export const rateLimiter: RateLimiter = new RedisRateLimiter();


