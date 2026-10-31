import { prisma } from "@/db/prisma";

export const ANALYTICS_START_AT_KEY = "analytics_start_at";

export function parseAnalyticsStartAt(value: unknown): Date | undefined {
  if (typeof value !== "string") return undefined;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function analyticsCreatedAtFilter(startAt: Date | undefined) {
  return startAt ? { createdAt: { gte: startAt } } : {};
}

export function analyticsSince(startAt: Date | undefined, fallback: Date): Date {
  return startAt && startAt > fallback ? startAt : fallback;
}

export async function getAnalyticsStartAt(): Promise<Date | undefined> {
  try {
    const setting = await prisma.storeSetting.findUnique({
      where: { key: ANALYTICS_START_AT_KEY },
      select: { value: true }
    });

    return parseAnalyticsStartAt(setting?.value);
  } catch {
    return undefined;
  }
}
