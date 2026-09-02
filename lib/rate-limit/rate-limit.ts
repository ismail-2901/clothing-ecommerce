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
  private readonly buckets = new Map<string, Bucket>();

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

export const rateLimiter: RateLimiter = new InMemoryRateLimiter();

