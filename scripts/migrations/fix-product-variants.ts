import { prisma } from "@/db/prisma";

/**
 * Migration: Split comma-separated size variants and deduplicate redundant product variants.
 * Usage:
 *   npx tsx scripts/migrations/fix-product-variants.ts [--dry-run] [--confirm]
 */

const isDryRun = process.argv.includes("--dry-run");
const isConfirmed = process.argv.includes("--confirm");

async function splitCommaVariants() {
  const bad = await prisma.productVariant.findMany({
    where: { deletedAt: null, size: { contains: "," } },
  });

  console.log(`Found ${bad.length} variants with comma-separated sizes.`);
  const log: string[] = [];

  for (const v of bad) {
    const sizes = v.size
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    console.log(`[SPLIT] Variant ${v.id} (${v.sku}) -> [${sizes.join(", ")}]`);

    if (!isDryRun) {
      await prisma.productVariant.update({
        where: { id: v.id },
        data: { deletedAt: new Date() },
      });
    }

    for (const size of sizes) {
      const baseSku = v.sku.replace(/[^A-Z0-9-]/gi, "").slice(0, 20);
      const sku = `${baseSku}-${size}`;
      const existing = await prisma.productVariant.findFirst({
        where: { sku, deletedAt: null },
      });

      if (!existing) {
        if (!isDryRun) {
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
        }
        log.push(`split->created: ${sku} (${size})`);
      } else {
        log.push(`split->already-exists: ${sku}`);
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
      console.log(`[DEDUP] Removing duplicate variant ${d.sku} for ${key}`);
      if (!isDryRun) {
        await prisma.productVariant.update({
          where: { id: d.id },
          data: { deletedAt: new Date() },
        });
      }
      log.push(`dedup->deleted: ${d.sku} (${key})`);
    }
  }

  return log;
}

async function main() {
  console.log("--------------------------------------------------");
  console.log("Product Variants Fix & Deduplication Migration");
  console.log(`Mode: ${isDryRun ? "DRY-RUN (no changes made)" : "LIVE EXECUTION"}`);
  console.log("--------------------------------------------------");

  if (!isDryRun && !isConfirmed) {
    console.error("ERROR: Live database modification requires --confirm flag.");
    console.error("Run with --dry-run to inspect or --confirm to execute.");
    process.exit(1);
  }

  const splitLog = await splitCommaVariants();
  const dedupLog = await deduplicateVariants();

  console.log("\nSummary:");
  console.log(`- Split operations: ${splitLog.length}`);
  console.log(`- Deduplicated variants: ${dedupLog.length}`);
  console.log("Done.");

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("Migration error:", e);
  await prisma.$disconnect();
  process.exit(1);
});
