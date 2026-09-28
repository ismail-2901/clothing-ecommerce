import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

function createPool(): Pool {
  const connectionString =
    process.env.DATABASE_URL ??
    "postgresql://placeholder:placeholder@localhost:5432/placeholder";

  return new Pool({
    connectionString,
    // Priority-1: Connection Pooling — reuse connections across serverless invocations
    // instead of creating a fresh TCP socket per request.
    max: parseInt(process.env.DB_POOL_MAX ?? "10"),          // max simultaneous connections
    idleTimeoutMillis: 30_000,                                // release idle connections after 30 s
    connectionTimeoutMillis: 5_000                            // fail fast if pool is exhausted
  });
}

function createClient(): PrismaClient {
  const pool = globalForPrisma.pgPool ?? createPool();
  if (!globalForPrisma.pgPool) globalForPrisma.pgPool = pool;

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"]
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
