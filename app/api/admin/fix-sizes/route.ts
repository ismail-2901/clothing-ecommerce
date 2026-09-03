import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { isValidAdminSession } from "@/lib/auth/admin-auth";
import { cookies } from "next/headers";

async function runFix() {
  const bad = await prisma.productVariant.findMany({
    where: { deletedAt: null, size: { contains: "," } },
  });

  const results: string[] = [];

  for (const v of bad) {
    const sizes = v.size.split(",").map((s) => s.trim()).filter(Boolean);

    await prisma.productVariant.update({
      where: { id: v.id },
      data: { deletedAt: new Date() },
    });

    for (const size of sizes) {
      const sku = `${v.sku}-${size}`;
      const existing = await prisma.productVariant.findFirst({ where: { sku } });
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
        results.push(`Created ${sku} (${size})`);
      } else {
        results.push(`Skipped ${sku} — already exists`);
      }
    }
  }

  return { fixed: bad.length, results };
}

// GET — visit in browser while logged in as admin to trigger the fix
export async function GET() {
  const cookieStore = await cookies();
  if (!isValidAdminSession(cookieStore.get("admin_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await runFix());
}

export async function POST() {
  const cookieStore = await cookies();
  if (!isValidAdminSession(cookieStore.get("admin_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await runFix());
}
