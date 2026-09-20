import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { ensureTestDatabase, cleanupDatabase } from "./test-db";
import { GET } from "@/app/api/health/route";
import { prisma } from "@/db/prisma";

describe("Health Endpoint: Database & Migration Diagnostics", () => {
  let db: PrismaClient;

  beforeAll(async () => {
    db = await ensureTestDatabase();
  });

  beforeEach(async () => {
    await cleanupDatabase(db);
  });

  it("reports 'ready' and 200 when DB is connected and all migrations are current", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("healthy");
    expect(body.database).toBe("connected");
    expect(body.schema).toBe("ready");
    expect(body.responseTimeMs).toBeGreaterThanOrEqual(0);
  });

  it("reports 'failed' and 503 when a migration in _prisma_migrations rolled back or failed", async () => {
    const originalQueryRaw = prisma.$queryRaw;
    (prisma as any).$queryRaw = async (strings: any, ...values: any[]) => {
      const queryStr = Array.isArray(strings) ? strings.join("?") : String(strings);
      if (queryStr.includes("_prisma_migrations")) {
        return [
          {
            migration_name: "20260904000000_failed_migration",
            finished_at: null,
            rolled_back_at: new Date()
          }
        ];
      }
      return originalQueryRaw.apply(prisma, [strings, ...values]);
    };

    try {
      const res = await GET();
      expect(res.status).toBe(503);
      const body = await res.json();
      expect(body.status).toBe("degraded");
      expect(body.database).toBe("connected");
      expect(body.schema).toBe("failed");
    } finally {
      (prisma as any).$queryRaw = originalQueryRaw;
    }
  });

  it("reports 'pending' and 503 if latest expected migration is not applied", async () => {
    const originalQueryRaw = prisma.$queryRaw;
    (prisma as any).$queryRaw = async (strings: any, ...values: any[]) => {
      const queryStr = Array.isArray(strings) ? strings.join("?") : String(strings);
      if (queryStr.includes("_prisma_migrations")) {
        return [
          {
            migration_name: "20260902165854_init",
            finished_at: new Date(),
            rolled_back_at: null
          }
        ];
      }
      return originalQueryRaw.apply(prisma, [strings, ...values]);
    };

    try {
      const res = await GET();
      expect(res.status).toBe(503);
      const body = await res.json();
      expect(body.status).toBe("degraded");
      expect(body.database).toBe("connected");
      expect(body.schema).toBe("pending");
    } finally {
      (prisma as any).$queryRaw = originalQueryRaw;
    }
  });

  it("reports 'missing' and 503 if _prisma_migrations is empty", async () => {
    const originalQueryRaw = prisma.$queryRaw;
    (prisma as any).$queryRaw = async (strings: any, ...values: any[]) => {
      const queryStr = Array.isArray(strings) ? strings.join("?") : String(strings);
      if (queryStr.includes("_prisma_migrations")) {
        return [];
      }
      return originalQueryRaw.apply(prisma, [strings, ...values]);
    };

    try {
      const res = await GET();
      expect(res.status).toBe(503);
      const body = await res.json();
      expect(body.status).toBe("degraded");
      expect(body.database).toBe("connected");
      expect(body.schema).toBe("missing");
    } finally {
      (prisma as any).$queryRaw = originalQueryRaw;
    }
  });

  it("reports 'disconnected' and 'unavailable' with 503 when DB connection fails", async () => {
    // Temporarily disconnect Prisma
    await prisma.$disconnect();
    
    // Simulate disconnected DB by passing an unresolvable query or disconnected client
    const originalQueryRaw = prisma.$queryRaw;
    (prisma as any).$queryRaw = async () => {
      throw new Error("Connection terminated");
    };

    try {
      const res = await GET();
      expect(res.status).toBe(503);
      const body = await res.json();
      expect(body.status).toBe("degraded");
      expect(body.database).toBe("disconnected");
      expect(body.schema).toBe("unavailable");
    } finally {
      (prisma as any).$queryRaw = originalQueryRaw;
      await prisma.$connect();
    }
  });
});
