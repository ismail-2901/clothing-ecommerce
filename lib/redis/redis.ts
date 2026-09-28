import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redisClient?: Redis | null;
};

function createRedisClient(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[redis] REDIS_URL not set — caching & distributed rate-limit disabled.");
    }
    return null;
  }

  const client = new Redis(url, {
    maxRetriesPerRequest: 2,
    enableReadyCheck: false,
    lazyConnect: false,
    connectTimeout: 3_000,
    // Don't crash the process if Redis is unreachable
    retryStrategy: (times) => (times > 3 ? null : Math.min(times * 100, 500))
  });

  client.on("error", (err) => {
    // Log but never crash — app degrades gracefully without Redis
    console.error("[redis] connection error:", err.message);
  });

  return client;
}

// Reuse client across hot reloads in development
export const redis: Redis | null =
  globalForRedis.redisClient !== undefined
    ? globalForRedis.redisClient
    : (globalForRedis.redisClient = createRedisClient());
