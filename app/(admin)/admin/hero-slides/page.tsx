export const dynamic = "force-dynamic";

import { prisma } from "@/db/prisma";
import { AdminHeroSlidesManager } from "@/components/admin/admin-hero-slides-manager";
import type { HeroSlideData } from "@/lib/cache/db-cache";

export default async function AdminHeroSlidesPage() {
  const row = await prisma.homepageSection.findUnique({ where: { key: "hero-slides" } });
  const slides: HeroSlideData[] = (row?.content as HeroSlideData[]) ?? [];

  return <AdminHeroSlidesManager initialSlides={slides} />;
}
