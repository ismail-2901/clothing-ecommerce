import { test } from "@playwright/test";

const targets = [
  { name: "Homepage", url: "https://elaris-store.vercel.app/" },
  { name: "Shop Catalog", url: "https://elaris-store.vercel.app/shop" },
  { name: "PDP (Black Linen Shirt)", url: "https://elaris-store.vercel.app/products/black-linen-shirt" }
];

test.describe("Live Production Core Web Vitals", () => {
  for (const target of targets) {
    test(`measure vitals on ${target.name}`, async ({ page }) => {
      await page.addInitScript(() => {
        (window as any).__vitals = { lcp: 0, cls: 0 };

        try {
          const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            (window as any).__vitals.lcp = lastEntry.startTime;
          });
          lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
        } catch (e) {}

        try {
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries() as any[]) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
            (window as any).__vitals.cls = clsValue;
          });
          clsObserver.observe({ type: "layout-shift", buffered: true });
        } catch (e) {}
      });

      await page.goto(target.url, { waitUntil: "load", timeout: 45000 });
      await page.waitForTimeout(2000);

      const metrics = await page.evaluate(() => {
        const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
        const paints = performance.getEntriesByType("paint");
        const fcp = paints.find((p) => p.name === "first-contentful-paint");

        return {
          ttfbMs: nav ? Math.round(nav.responseStart - nav.requestStart) : 0,
          fcpMs: fcp ? Math.round(fcp.startTime) : 0,
          lcpMs: Math.round((window as any).__vitals?.lcp || 0),
          cls: Number(((window as any).__vitals?.cls || 0).toFixed(4)),
          domContentLoadedMs: nav ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : 0,
          loadDurationMs: nav ? Math.round(nav.loadEventEnd - nav.startTime) : 0
        };
      });

      console.log(`[VITALS][${target.name}] ->`, JSON.stringify(metrics));
    });
  }
});
