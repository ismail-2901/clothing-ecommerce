import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export const dynamic = "force-dynamic";

const LATEST_COMMITTED_MIGRATION = "20260903093835_add_otp_fields";

export async function GET() {
  const startTime = Date.now();
  let dbStatus: "connected" | "disconnected" = "disconnected";
  let migrationStatus: "ready" | "pending" | "missing" | "failed" | "unavailable" = "unavailable";

  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database connection timeout")), 3000)
      )
    ]);
    dbStatus = "connected";

    // Inspect _prisma_migrations table directly
    const migrations = await prisma.$queryRaw<
      Array<{
        migration_name: string;
        finished_at: Date | null;
        rolled_back_at: Date | null;
      }>
    >`
      SELECT migration_name, finished_at, rolled_back_at 
      FROM "_prisma_migrations" 
      ORDER BY started_at DESC
    `.catch(() => null);

    if (migrations === null || migrations.length === 0) {
      migrationStatus = "missing";
    } else {
      const hasFailed = migrations.some((m) => m.rolled_back_at !== null || m.finished_at === null);
      if (hasFailed) {
        migrationStatus = "failed";
      } else {
        const latestFinished = migrations.find((m) => m.finished_at !== null)?.migration_name;
        if (latestFinished === LATEST_COMMITTED_MIGRATION) {
          migrationStatus = "ready";
        } else {
          migrationStatus = "pending";
        }
      }
    }
  } catch {
    dbStatus = "disconnected";
    migrationStatus = "unavailable";
  }

  const isHealthy = dbStatus === "connected" && migrationStatus === "ready";

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
