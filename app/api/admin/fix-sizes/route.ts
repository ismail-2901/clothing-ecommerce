import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { isValidAdminSession } from "@/lib/auth/admin-auth";
import { cookies } from "next/headers";

/**
 * GET /api/admin/fix-sizes
 * Logged-in admin only. Runs two cleanup passes:
 *  1. Split any variant whose size contains a comma ("M, L, XL") into individual rows.
 *  2. Deduplicate variants with the same productId+color+size by soft-deleting all but
 *     the first (lowest createdAt).
 */

async function splitCommaVariants() {
  const bad = await prisma.productVariant.findMany({
    where: { deletedAt: null, size: { contains: "," } },
  });

  const log: string[] = [];

  for (const v of bad) {
    const sizes = v.size
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    await prisma.productVariant.update({
      where: { id: v.id },
      data: { deletedAt: new Date() },
    });

    for (const size of sizes) {
      const baseSku = v.sku.replace(/[^A-Z0-9-]/gi, "").slice(0, 20);
      const sku = `${baseSku}-${size}`;
      const existing = await prisma.productVariant.findFirst({
        where: { sku, deletedAt: null },
      });
      if (!existing) {
        await prisma.productVariant.create({
          data: {
            productId: v.productId,
            sku,
            color: v.color,
            size,
            stockQuantity: v.stockQuantity,
            isAvailable: v.isAvailable,
            priceOverride: v.priceOverride,
          },
        });
        log.push(`split→created ${sku}`);
      } else {
        log.push(`split→exists ${sku}`);
      }
    }
  }

  return log;
}

async function deduplicateVariants() {
  // Find all active variants grouped by productId+color+size
  const all = await prisma.productVariant.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" }, // keep oldest
  });

  // Group by product+color+size
  const groups = new Map<string, typeof all>();
  for (const v of all) {
    const key = `${v.productId}||${v.color}||${v.size}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(v);
  }

  const log: string[] = [];

  for (const [key, rows] of groups) {
    if (rows.length <= 1) continue;
    // Keep first (oldest), soft-delete rest
    const [, ...dupes] = rows;
    for (const d of dupes) {
      await prisma.productVariant.update({
        where: { id: d.id },
        data: { deletedAt: new Date() },
      });
      log.push(`dedup→deleted ${d.sku} (${key})`);
    }
  }

  return log;
}

export async function GET() {
  const cookieStore = await cookies();
  if (!isValidAdminSession(cookieStore.get("admin_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const splitLog = await splitCommaVariants();
  const dedupLog = await deduplicateVariants();

  return NextResponse.json({
    splitFixed: splitLog.length,
    dedupFixed: dedupLog.length,
    log: [...splitLog, ...dedupLog],
  });
}

export async function POST() {
  const cookieStore = await cookies();
  if (!isValidAdminSession(cookieStore.get("admin_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const splitLog = await splitCommaVariants();
  const dedupLog = await deduplicateVariants();

  return NextResponse.json({
    splitFixed: splitLog.length,
    dedupFixed: dedupLog.length,
    log: [...splitLog, ...dedupLog],
  });
}
