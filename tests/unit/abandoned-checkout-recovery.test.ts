import { describe, expect, it } from "vitest";

describe("Abandoned Checkout Recovery Throttling & Governance", () => {
  function checkRecoveryDispatchEligibility(
    email: string | null,
    lastSentIso: string | null,
    force = false
  ) {
    if (!email || !email.includes("@")) {
      return { eligible: false, reason: "NO_EMAIL" };
    }

    if (lastSentIso && !force) {
      const lastSentTime = new Date(lastSentIso).getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (Date.now() - lastSentTime < twentyFourHours) {
        return { eligible: false, reason: "THROTTLED_24H", lastSent: lastSentIso };
      }
    }

    return { eligible: true };
  }

  it("rejects guest sessions without captured email address", () => {
    const result = checkRecoveryDispatchEligibility(null, null);
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe("NO_EMAIL");

    const invalidEmailResult = checkRecoveryDispatchEligibility("notanemail", null);
    expect(invalidEmailResult.eligible).toBe(false);
  });

  it("enforces 24-hour throttling to prevent customer duplicate spamming", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const throttledResult = checkRecoveryDispatchEligibility("buyer@example.com", twoHoursAgo, false);

    expect(throttledResult.eligible).toBe(false);
    expect(throttledResult.reason).toBe("THROTTLED_24H");

    // Allows forced manual override by supervisor
    const forcedResult = checkRecoveryDispatchEligibility("buyer@example.com", twoHoursAgo, true);
    expect(forcedResult.eligible).toBe(true);
  });

  it("permits dispatch when previous attempt was more than 24 hours ago", () => {
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const result = checkRecoveryDispatchEligibility("buyer@example.com", twoDaysAgo, false);
    expect(result.eligible).toBe(true);
  });

  it("permits initial dispatch for new uncontacted abandoned cart", () => {
    const result = checkRecoveryDispatchEligibility("buyer@example.com", null, false);
    expect(result.eligible).toBe(true);
  });
});

