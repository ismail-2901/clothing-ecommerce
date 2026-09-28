import { redis } from "@/lib/redis/redis";

const DEFAULT_TTL_SECONDS = 60; // 1 minute for product catalog

/**
 * Get a cached value from Redis. Returns null if Redis is unavailable or key missing.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const raw = await redis.get(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Store a value in Redis with an optional TTL (seconds).
 * Silently no-ops when Redis is unavailable.
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // Never block the caller — cache writes are best-effort
  }
}

/**
 * Delete one or more cache keys. Used for cache invalidation.
 * Silently no-ops when Redis is unavailable.
 */
export async function cacheDel(...keys: string[]): Promise<void> {
  if (!redis || keys.length === 0) return;
  try {
    await redis.del(...keys);
  } catch {
    // Ignore
  }
}

/**
 * Delete all keys matching a glob pattern (e.g. "catalog:*").
 * Use sparingly — SCAN is O(N) on keyspace size.
 */
export async function cacheDelPattern(pattern: string): Promise<void> {
  if (!redis) return;
  try {
    let cursor = "0";
    do {
      const [nextCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== "0");
  } catch {
    // Ignore
  }
}
