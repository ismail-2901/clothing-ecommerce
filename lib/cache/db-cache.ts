/**
 * Priority-4: Next.js ISR caching for stable, infrequently-changing data.
 * Uses unstable_cache (Next.js built-in) which integrates with the
 * Data Cache and supports revalidateTag() for on-demand invalidation.
 */
import { unstable_cache } from "next/cache";
import { prisma } from "@/db/prisma";

/**
 * Categories -- cached for 5 minutes, tag "categories".
 * Invalidate with: revalidateTag("categories", "max")
 */
export const getCachedCategories = unstable_cache(
  async () =>
    prisma.category.findMany({
      where: { deletedAt: null },
      select: { name: true, slug: true },
      orderBy: [{ position: "asc" }, { name: "asc" }]
    }),
  ["categories"],
  { revalidate: 300, tags: ["categories"] }
);

/**
 * Active coupons banner data -- cached for 5 minutes, tag "coupons".
 * Uses correct Prisma field names from schema (endsAt, type, value).
 */
export const getCachedActiveCoupons = unstable_cache(
  async () =>
    prisma.coupon.findMany({
      where: {
        status: "ACTIVE",
        deletedAt: null,
        OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }]
      },
      select: { id: true, code: true, title: true, type: true, value: true },
      orderBy: { createdAt: "desc" },
      take: 10
    }),
  ["coupons-active"],
  { revalidate: 300, tags: ["coupons"] }
);