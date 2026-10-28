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
        select: {
          id: true,
          name: true,
          slug: true,
          parentId: true,
          children: {
            where: { deletedAt: null },
            select: { id: true, name: true, slug: true },
            orderBy: [{ position: "asc" }, { name: "asc" }]
          }
        },
        orderBy: [{ position: "asc" }, { name: "asc" }]
      });
    } catch (err) {
      console.error("[db-cache:getCachedCategories]", err);
      return [];
    }
  },
  ["categories"],
  { revalidate: 3600, tags: ["categories"] } // 1 hour — categories rarely change
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
  { revalidate: 1800, tags: ["coupons"] } // 30 min
);

/**
 * Hero slides -- cached for 10 min, tag "hero-slides".
 * Invalidate with: revalidateTag("hero-slides", "max")
 * Falls back to [] so the storefront can use hardcoded defaults.
 */
export type HeroSlideData = {
  id: string;
  num: string;
  kicker: string;
  headline: [string, string];
  subline: string;
  ctaText: string;
  ctaHref: string;
  image: string;
  alt: string;
  badgeDiscount: string;
  badgeNote: string;
  isActive: boolean;
};

export const getCachedHeroSlides = unstable_cache(
  async (): Promise<HeroSlideData[]> => {
    try {
      const row = await prisma.homepageSection.findUnique({
        where: { key: "hero-slides" }
      });
      if (!row || !row.isActive) return [];
      const slides = row.content as unknown[];
      return (slides as HeroSlideData[]).filter((s) => s.isActive !== false);
    } catch (err) {
      console.error("[db-cache:getCachedHeroSlides]", err);
      return [];
    }
  },
  ["hero-slides"],
  { revalidate: 600, tags: ["hero-slides"] } // 10 min
);