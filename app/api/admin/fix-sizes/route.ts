import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

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
            color: v.color.trim(),
            size,
            stockQuantity: v.stockQuantity,
            isAvailable: v.isAvailable,
            priceOverride: v.priceOverride,
          },
        });
        log.push(`split→created ${sku} (${size})`);
      } else {
        log.push(`split→exists ${sku}`);
      }
    }
  }

  return log;
}

async function deduplicateVariants() {
  const all = await prisma.productVariant.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
  });

  const groups = new Map<string, typeof all>();
  for (const v of all) {
    const key = `${v.productId}||${v.color.trim().toLowerCase()}||${v.size.trim().toUpperCase()}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(v);
  }

  const log: string[] = [];

  for (const [key, rows] of groups) {
    if (rows.length <= 1) continue;
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
  try {
    const splitLog = await splitCommaVariants();
    const dedupLog = await deduplicateVariants();
    return NextResponse.json({
      success: true,
      splitFixed: splitLog.length,
      dedupFixed: dedupLog.length,
      log: [...splitLog, ...dedupLog],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
