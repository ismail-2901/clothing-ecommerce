import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { isValidAdminSession } from "@/lib/auth/admin-auth";
import { cookies } from "next/headers";

export async function POST() {
  // Admin-only
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("admin_session")?.value;
  if (!isValidAdminSession(adminCookie)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    }
  }

  return NextResponse.json({ fixed: bad.length, results });
}
