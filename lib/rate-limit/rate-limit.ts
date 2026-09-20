export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
};

export interface RateLimiter {
  consume(key: string, limit: number, windowMs: number): Promise<RateLimitResult>;
}

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

// BUG-01 fix: store on globalThis so the rate-limit state survives Next.js
// hot-module reloads in development. In production, replace with a
// Redis/Upstash-backed implementation to share state across instances.
const GLOBAL_KEY = Symbol.for("elaris.rateLimiterBuckets");
type RateLimiterGlobal = typeof globalThis & { [GLOBAL_KEY]?: Map<string, Bucket> };

const g = globalThis as RateLimiterGlobal;
if (!g[GLOBAL_KEY]) {
  g[GLOBAL_KEY] = new Map<string, Bucket>();
}

export const rateLimiter: RateLimiter = new InMemoryRateLimiter(g[GLOBAL_KEY]!);

