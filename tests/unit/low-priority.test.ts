import { describe, it, expect } from "vitest";
import { storeConfig } from "@/config/store";
import { metadata as homeMetadata } from "@/app/(storefront)/page";
import { metadata as shopMetadata } from "@/app/(storefront)/shop/page";
import { metadata as collectionsMetadata } from "@/app/(storefront)/collections/page";
import { metadata as aboutMetadata } from "@/app/(storefront)/about/page";
import { metadata as contactMetadata } from "@/app/(storefront)/contact/layout";
import { metadata as faqMetadata } from "@/app/(storefront)/faq/page";
import { metadata as shippingMetadata } from "@/app/(storefront)/shipping/page";
import { metadata as returnsMetadata } from "@/app/(storefront)/returns/page";
import { metadata as privacyMetadata } from "@/app/(storefront)/privacy/page";
import { metadata as termsMetadata } from "@/app/(storefront)/terms/page";
import { metadata as offersMetadata } from "@/app/(storefront)/offers/page";
import fs from "node:fs";
import path from "node:path";

describe("LOW-01: Deprecated /api/checkout elimination", () => {
  it("ensures app/api/checkout/route.ts does not exist", () => {
    const routePath = path.join(process.cwd(), "app", "api", "checkout", "route.ts");
    expect(fs.existsSync(routePath)).toBe(false);
  });
});

describe("LOW-02 & LOW-03: Social configuration in storeConfig", () => {
  it("provides valid Elaris social URLs and does not invent fake URLs for unconfigured channels", () => {
    expect(storeConfig.social).toBeDefined();
    // Real configured Elaris accounts
    expect(storeConfig.social.instagram).toBe("https://instagram.com/elarisstore");
    expect(storeConfig.social.facebook).toBe("https://facebook.com/elarisstore");

    // Unconfigured channels default to undefined unless explicitly passed in env
    if (!process.env.STORE_TIKTOK_URL) {
      expect(storeConfig.social.tiktok).toBeUndefined();
    }
    if (!process.env.STORE_YOUTUBE_URL) {
      expect(storeConfig.social.youtube).toBeUndefined();
    }
  });
});

describe("LOW-06: Canonical URLs on storefront pages", () => {
  it("declares accurate canonical alternates for all primary storefront pages", () => {
    expect(homeMetadata.alternates?.canonical).toBe("/");
    expect(shopMetadata.alternates?.canonical).toBe("/shop");
    expect(collectionsMetadata.alternates?.canonical).toBe("/collections");
    expect(aboutMetadata.alternates?.canonical).toBe("/about");
    expect(contactMetadata.alternates?.canonical).toBe("/contact");
    expect(faqMetadata.alternates?.canonical).toBe("/faq");
    expect(shippingMetadata.alternates?.canonical).toBe("/shipping");
    expect(returnsMetadata.alternates?.canonical).toBe("/returns");
    expect(privacyMetadata.alternates?.canonical).toBe("/privacy");
    expect(termsMetadata.alternates?.canonical).toBe("/terms");
    expect(offersMetadata.alternates?.canonical).toBe("/offers");
  });
});

describe("LOW-09: AI package removal & zero-cost architecture", () => {
  it("confirms package.json does not depend on 'ai' SDK", () => {
    const pkgJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8"));
    expect(pkgJson.dependencies?.ai).toBeUndefined();
  });
});
