/**
 * Priority-4: Next.js ISR caching for stable, infrequently-changing data.
 * Uses unstable_cache (Next.js built-in) which integrates with the
 * Data Cache and supports revalidateTag() for on-demand invalidation.
 */
import { unstable_cache } from "next/cache";
import { prisma } from "@/db/prisma";

/**
 * Categories -- cached for 5 minutes, tag "categories".
 * Invalidate with: revalidateTag("categories")
 *
 * Returns [] gracefully when the database is unreachable so callers
 * (e.g. /shop) never see an unhandled P1001 throw.
 */
export const getCachedCategories = unstable_cache(
  async () => {
    try {
      return await prisma.category.findMany({
        where: { deletedAt: null },
        select: { name: true, slug: true },
        orderBy: [{ position: "asc" }, { name: "asc" }]
      });
    } catch (err) {
      console.error("[db-cache:getCachedCategories]", err);
      return [];
    }
  },
  ["categories"],
  { revalidate: 300, tags: ["categories"] }
);

/**
 * Active coupons banner data -- cached for 5 minutes, tag "coupons".
 * Uses correct Prisma field names from schema (endsAt, type, value).
 *
 * Returns [] gracefully when the database is unreachable.
 */
export const getCachedActiveCoupons = unstable_cache(
  async () => {
    try {
      return await prisma.coupon.findMany({
        where: {
          status: "ACTIVE",
          deletedAt: null,
          OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }]
        },
        select: { id: true, code: true, title: true, type: true, value: true },
        orderBy: { createdAt: "desc" },
        take: 10
      });
    } catch (err) {
      console.error("[db-cache:getCachedActiveCoupons]", err);
      return [];
    }
  },
  ["coupons-active"],
  { revalidate: 300, tags: ["coupons"] }
);