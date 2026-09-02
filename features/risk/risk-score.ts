export type RiskInput = {
  failedDeliveries: number;
  codRefusals: number;
  cancellationsLast90Days: number;
  returnsLast180Days: number;
  paymentFailuresLast30Days: number;
  ordersLast24Hours: number;
  accountAgeDays: number;
  orderValueMinor: number;
  averageOrderValueMinor?: number;
};

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type RiskResult = {
  score: number;
  level: RiskLevel;
  signals: string[];
  recommendedAction: "APPROVE" | "REVIEW" | "CONTACT_CUSTOMER" | "HOLD";
};

export function scoreOrderRisk(input: RiskInput): RiskResult {
  const signals: string[] = [];
  let score = 0;

  score += addSignal(input.failedDeliveries >= 2, 22, "Multiple failed deliveries", signals);
  score += addSignal(input.codRefusals >= 2, 18, "Repeated COD refusals", signals);
  score += addSignal(input.cancellationsLast90Days >= 3, 16, "High recent cancellation frequency", signals);
  score += addSignal(input.returnsLast180Days >= 4, 12, "Elevated return frequency", signals);
  score += addSignal(input.paymentFailuresLast30Days >= 2, 12, "Recent payment failures", signals);
  score += addSignal(input.ordersLast24Hours >= 4, 10, "Unusual order velocity", signals);
  score += addSignal(input.accountAgeDays <= 1 && input.orderValueMinor >= 1000000, 10, "New account with high order value", signals);

  if (input.averageOrderValueMinor && input.orderValueMinor > input.averageOrderValueMinor * 4) {
    score += 10;
    signals.push("Order value is far above customer average");
  }

  const cappedScore = Math.min(100, score);
  const level = riskLevelForScore(cappedScore);

  return {
    score: cappedScore,
    level,
    signals,
    recommendedAction:
      level === "CRITICAL"
        ? "HOLD"
        : level === "HIGH"
          ? "CONTACT_CUSTOMER"
          : level === "MEDIUM"
            ? "REVIEW"
            : "APPROVE"
  };
}

export function riskLevelForScore(score: number): RiskLevel {
  if (score >= 80) {
    return "CRITICAL";
  }

  if (score >= 60) {
    return "HIGH";
  }

  if (score >= 30) {
    return "MEDIUM";
  }

  return "LOW";
}

function addSignal(condition: boolean, weight: number, signal: string, signals: string[]) {
  if (!condition) {
    return 0;
  }

  signals.push(signal);
  return weight;
}

