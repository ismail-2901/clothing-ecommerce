import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { requireAdminSession } from "@/lib/auth/server";
import { revalidateTag } from "next/cache";
import { invalidateCatalogCache } from "@/features/catalog/data";

const HERO_KEY = "hero-slides";

const slideSchema = z.object({
  id: z.string().min(1),
  num: z.string().min(1).max(4),
  kicker: z.string().min(1).max(80),
  headline: z.tuple([z.string().min(1).max(60), z.string().min(1).max(60)]),
  subline: z.string().min(1).max(160),
  ctaText: z.string().min(1).max(40),
  ctaHref: z.string().min(1).max(200),
  image: z.string().min(1).max(500),
  alt: z.string().min(1).max(200),
  badgeDiscount: z.string().max(10),
  badgeNote: z.string().max(40),
  isActive: z.boolean().default(true)
});

const putSchema = z.object({
  slides: z.array(slideSchema).min(1).max(8)
});

// GET — returns current hero slides (or empty if not set)
export async function GET(request: NextRequest) {
  const auth = await requireAdminSession("content:manage");
  if (!auth.ok) return auth.response;

  const row = await prisma.homepageSection.findUnique({
    where: { key: HERO_KEY }
  });

  return NextResponse.json({
    slides: (row?.content as unknown[]) ?? []
  });
}

// PUT — replace entire slides array (admin saves the full ordered list)
export async function PUT(request: NextRequest) {
  const auth = await requireAdminSession("content:manage");
  if (!auth.ok) return auth.response;
  const { userId } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const { slides } = parsed.data;

  const row = await prisma.homepageSection.upsert({
    where: { key: HERO_KEY },
    create: {
      key: HERO_KEY,
      title: "Hero Slides",
      content: slides,
      position: 0,
      isActive: true
    },
    update: {
      content: slides,
      updatedAt: new Date()
    }
  });

  if (userId) {
    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: "HERO_SLIDES_UPDATED",
        resource: "HomepageSection",
        resourceId: row.id,
        next: { slideCount: slides.length }
      }
    });
  }

  // Invalidate ISR tag + Redis so storefront picks up new slides immediately
  revalidateTag("hero-slides", "max");
  await invalidateCatalogCache();

  return NextResponse.json({ slides: row.content, saved: true });
}
