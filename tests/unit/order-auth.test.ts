import { describe, expect, it } from "vitest";

type OrderAccessContext = {
  orderUserId: string | null;
  orderGuestToken: string | null;
  callerUserId?: string | null;
  callerGuestToken?: string | null;
  isAdmin?: boolean;
};

type OrderAccessLevel = "NONE" | "TRACKING_ONLY" | "FULL";

function resolveOrderAccess(ctx: OrderAccessContext, requestedView?: string | null): OrderAccessLevel {
  if (ctx.isAdmin) {
    return "FULL";
  }

  if (ctx.callerUserId && ctx.orderUserId && ctx.callerUserId === ctx.orderUserId) {
    return "FULL";
  }

  if (!ctx.orderUserId && ctx.orderGuestToken && ctx.callerGuestToken && ctx.orderGuestToken === ctx.callerGuestToken) {
    return "FULL";
  }

  if (requestedView === "tracking") {
    return "TRACKING_ONLY";
  }

  return "NONE";
}

describe("order access control (IDOR prevention)", () => {
  const orderOwnerId = "usr_123";
  const otherUserId = "usr_999";
  const validGuestToken = "guest_secret_token_abc";

  it("grants full access to admin unconditionally", () => {
    const access = resolveOrderAccess({
      orderUserId: orderOwnerId,
      orderGuestToken: null,
      isAdmin: true
    });
    expect(access).toBe("FULL");
  });

  it("grants full access to authenticated order owner", () => {
    const access = resolveOrderAccess({
      orderUserId: orderOwnerId,
      orderGuestToken: null,
      callerUserId: orderOwnerId,
      isAdmin: false
    });
    expect(access).toBe("FULL");
  });

  it("denies access to authenticated non-owner", () => {
    const access = resolveOrderAccess({
      orderUserId: orderOwnerId,
      orderGuestToken: null,
      callerUserId: otherUserId,
      isAdmin: false
    });
    expect(access).toBe("NONE");
  });

  it("grants full access to guest with matching guest token", () => {
    const access = resolveOrderAccess({
      orderUserId: null,
      orderGuestToken: validGuestToken,
      callerGuestToken: validGuestToken,
      isAdmin: false
    });
    expect(access).toBe("FULL");
  });

  it("denies access to guest with wrong or missing token", () => {
    const wrongTokenAccess = resolveOrderAccess({
      orderUserId: null,
      orderGuestToken: validGuestToken,
      callerGuestToken: "wrong_token",
      isAdmin: false
    });
    expect(wrongTokenAccess).toBe("NONE");

    const missingTokenAccess = resolveOrderAccess({
      orderUserId: null,
      orderGuestToken: validGuestToken,
      callerGuestToken: null,
      isAdmin: false
    });
    expect(missingTokenAccess).toBe("NONE");
  });

  it("allows limited tracking view without sensitive data when requested", () => {
    const trackingAccess = resolveOrderAccess(
      {
        orderUserId: orderOwnerId,
        orderGuestToken: null,
        callerUserId: null,
        isAdmin: false
      },
      "tracking"
    );
    expect(trackingAccess).toBe("TRACKING_ONLY");
  });
});
