import { describe, expect, it } from "vitest";
import { riskLevelForScore, scoreOrderRisk } from "@/features/risk/risk-score";

describe("risk scoring", () => {
  it("keeps low-risk orders approvable", () => {
    const result = scoreOrderRisk({
      failedDeliveries: 0,
      codRefusals: 0,
      cancellationsLast90Days: 0,
      returnsLast180Days: 0,
      paymentFailuresLast30Days: 0,
      ordersLast24Hours: 1,
      accountAgeDays: 120,
      orderValueMinor: 200000
    });

    expect(result.level).toBe("LOW");
    expect(result.recommendedAction).toBe("APPROVE");
  });

  it("uses explainable signals for higher risk", () => {
    const result = scoreOrderRisk({
      failedDeliveries: 3,
      codRefusals: 2,
      cancellationsLast90Days: 4,
      returnsLast180Days: 5,
      paymentFailuresLast30Days: 3,
      ordersLast24Hours: 5,
      accountAgeDays: 0,
      orderValueMinor: 1200000,
      averageOrderValueMinor: 200000
    });

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.level).toBe("CRITICAL");
    expect(result.signals).toContain("Multiple failed deliveries");
  });

  it("maps score bands correctly", () => {
    expect(riskLevelForScore(29)).toBe("LOW");
    expect(riskLevelForScore(30)).toBe("MEDIUM");
    expect(riskLevelForScore(60)).toBe("HIGH");
    expect(riskLevelForScore(80)).toBe("CRITICAL");
  });
});

