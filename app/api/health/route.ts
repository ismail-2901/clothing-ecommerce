import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus: "connected" | "disconnected" = "disconnected";
  let migrationStatus: "ready" | "pending" | "unavailable" = "unavailable";

  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database connection timeout")), 3000)
      )
    ]);
    dbStatus = "connected";

    const migrations = await prisma.$queryRaw<Array<{ migration_name: string }>>`
      SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL ORDER BY finished_at DESC LIMIT 1
    `.catch(() => []);

    migrationStatus = migrations.length > 0 ? "ready" : "pending";
  } catch {
    dbStatus = "disconnected";
    migrationStatus = "unavailable";
  }

  const isHealthy = dbStatus === "connected";

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      build: process.env.BUILD_ID || process.env.npm_package_version || "0.1.0",
      database: dbStatus,
      schema: migrationStatus,
      responseTimeMs: Date.now() - startTime,
      timestamp: new Date().toISOString()
    },
    { status: isHealthy ? 200 : 503 }
  );
}
