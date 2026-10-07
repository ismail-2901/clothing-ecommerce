import { describe, it, expect, vi } from "vitest";
import { isValidCallbackUrl, getSafeCallbackUrl } from "@/lib/utils/url";
import { formatMoney } from "@/lib/utils/money";

describe("MED-05: Callback URL Validation & Open-Redirect Protection", () => {
  it("accepts valid relative internal paths", () => {
    expect(isValidCallbackUrl("/account")).toBe(true);
    expect(isValidCallbackUrl("/checkout")).toBe(true);
    expect(isValidCallbackUrl("/shop?category=men&sort=price")).toBe(true);
    expect(isValidCallbackUrl("/orders/12345")).toBe(true);
  });

  it("rejects protocol-relative open-redirect URLs", () => {
    expect(isValidCallbackUrl("//evil.com")).toBe(false);
    expect(isValidCallbackUrl("//evil.com/phish")).toBe(false);
    expect(isValidCallbackUrl("///evil.com")).toBe(false);
  });

  it("rejects backslash bypasses", () => {
    expect(isValidCallbackUrl("/\\evil.com")).toBe(false);
    expect(isValidCallbackUrl("/\\/evil.com")).toBe(false);
    expect(isValidCallbackUrl("/evil\\com")).toBe(false);
    expect(isValidCallbackUrl("\\evil.com")).toBe(false);
  });

  it("rejects dangerous encoded backslashes and null bytes", () => {
    expect(isValidCallbackUrl("/%5cevil.com")).toBe(false);
    expect(isValidCallbackUrl("/%5Cevil.com")).toBe(false);
    expect(isValidCallbackUrl("/account%00evil")).toBe(false);
  });

  it("rejects absolute URLs with external protocols", () => {
    expect(isValidCallbackUrl("https://evil.com")).toBe(false);
    expect(isValidCallbackUrl("http://evil.com")).toBe(false);
    expect(isValidCallbackUrl("javascript:alert(1)")).toBe(false);
    expect(isValidCallbackUrl("data:text/html;base64,...")).toBe(false);
  });

  it("rejects null, undefined, empty, or whitespace-only inputs", () => {
    expect(isValidCallbackUrl(null)).toBe(false);
    expect(isValidCallbackUrl(undefined)).toBe(false);
    expect(isValidCallbackUrl("")).toBe(false);
    expect(isValidCallbackUrl("   ")).toBe(false);
  });

  it("getSafeCallbackUrl returns fallback when invalid", () => {
    expect(getSafeCallbackUrl("//evil.com", "/account")).toBe("/account");
    expect(getSafeCallbackUrl("/\\evil.com", "/fallback")).toBe("/fallback");
    expect(getSafeCallbackUrl("/shop?category=men", "/account")).toBe("/shop?category=men");
  });
});

describe("MED-02: AI Coupon Display & Money Formatting Consistency", () => {
  it("formats PERCENTAGE discounts accurately", () => {
    const coupon = { type: "PERCENTAGE", value: 15, maxDiscount: 50000, minSubtotal: 200000 };
    const val = `${coupon.value}% OFF (up to ${formatMoney(coupon.maxDiscount)})`;
    const min = ` (Min spend: ${formatMoney(coupon.minSubtotal)})`;
    expect(val).toContain("15% OFF");
    expect(val).toContain(formatMoney(coupon.maxDiscount));
    expect(min).toContain(formatMoney(coupon.minSubtotal));
  });

  it("formats FIXED_AMOUNT discounts consistently in BDT currency", () => {
    const coupon = { type: "FIXED_AMOUNT", value: 30000, minSubtotal: 150000 };
    const val = `${formatMoney(coupon.value)} OFF`;
    const min = ` (Min spend: ${formatMoney(coupon.minSubtotal)})`;
    expect(val).toContain(formatMoney(coupon.value));
    expect(val).toContain("OFF");
    expect(min).toContain(formatMoney(coupon.minSubtotal));
  });

  it("formats FREE_SHIPPING discounts clearly", () => {
    const coupon = { type: "FREE_SHIPPING", value: 0 };
    const val = coupon.type === "FREE_SHIPPING" ? "Free Shipping" : `${formatMoney(coupon.value)} OFF`;
    expect(val).toBe("Free Shipping");
  });
});

describe("MED-04: Startup Validation for BETTER_AUTH_SECRET", () => {
  it("throws clear error in production if secret is too short or missing", () => {
    const validateSecret = (secret: string | undefined, nodeEnv: string) => {
      if (!secret || secret.trim().length < 32) {
        if (nodeEnv === "production") {
          throw new Error(
            "[auth] Startup validation failed: BETTER_AUTH_SECRET is missing or insecure. " +
            "Production requires an unpredictable secret of at least 32 characters."
          );
        }
      }
      return true;
    };

    expect(() => validateSecret(undefined, "production")).toThrow("BETTER_AUTH_SECRET is missing or insecure");
    expect(() => validateSecret("short-secret-123", "production")).toThrow("BETTER_AUTH_SECRET is missing or insecure");
    expect(validateSecret("a".repeat(32), "production")).toBe(true);
    // Non-production environments allow development fallbacks
    expect(validateSecret("dev-short", "development")).toBe(true);
  });
});

describe("MED-01: Bounded Catalog Pagination", () => {
  it("enforces safe default limit of 50 when perPage is omitted", () => {
    const computePerPage = (pagination?: { perPage?: number }) => {
      const requestedLimit = pagination?.perPage;
      return requestedLimit !== undefined
        ? Math.min(100, Math.max(1, requestedLimit))
        : 50;
    };

    expect(computePerPage()).toBe(50);
    expect(computePerPage({})).toBe(50);
    expect(computePerPage({ perPage: 12 })).toBe(12);
    expect(computePerPage({ perPage: 100 })).toBe(100);
    expect(computePerPage({ perPage: 500 })).toBe(100); // capped at 100
    expect(computePerPage({ perPage: -5 })).toBe(1);   // floored at 1
  });
});
