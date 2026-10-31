import { describe, expect, it } from "vitest";
import {
  ANALYTICS_START_AT_KEY,
  analyticsCreatedAtFilter,
  parseAnalyticsStartAt
} from "@/features/admin/analytics";

describe("analytics reset window", () => {
  it("parses stored reset timestamps", () => {
    const startAt = parseAnalyticsStartAt("2026-10-31T18:00:00.000Z");

    expect(ANALYTICS_START_AT_KEY).toBe("analytics_start_at");
    expect(startAt?.toISOString()).toBe("2026-10-31T18:00:00.000Z");
  });

  it("ignores invalid reset values", () => {
    expect(parseAnalyticsStartAt(null)).toBeUndefined();
    expect(parseAnalyticsStartAt("not-a-date")).toBeUndefined();
  });

  it("filters records created after reset", () => {
    const startAt = new Date("2026-10-31T18:00:00.000Z");

    expect(analyticsCreatedAtFilter(startAt)).toEqual({ createdAt: { gte: startAt } });
    expect(analyticsCreatedAtFilter(undefined)).toEqual({});
  });
});
