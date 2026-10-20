import { test, expect } from "@playwright/test";

const PDP_URL = "/products/black-linen-shirt";

test.describe("Release-Gate: Detailed PDP LCP Verification (Cold vs Warm)", () => {
  test.describe.configure({ mode: "serial" });

  const coldResults: any[] = [];
  const warmResults: any[] = [];

  // Helper to observe LCP details
  const vitalsInitScript = () => {
    (window as any).__gateMetrics = {
      lcp: 0,
      lcpElement: null,
      lcpUrl: null,
      lcpSize: 0,
      cls: 0,
      fcp: 0
    };

    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        if (lastEntry) {
          (window as any).__gateMetrics.lcp = lastEntry.startTime;
          (window as any).__gateMetrics.lcpElement = lastEntry.element?.tagName || null;
          (window as any).__gateMetrics.lcpElementClass = lastEntry.element?.className || null;
          (window as any).__gateMetrics.lcpUrl = lastEntry.url || null;
          (window as any).__gateMetrics.lcpSize = lastEntry.size || 0;
        }
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
        (window as any).__gateMetrics.cls = clsValue;
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });
    } catch (e) {}
  };

  // 5 Cold runs: brand new context each time
  for (let i = 1; i <= 5; i++) {
    test(`Cold Run #${i} — Mobile PDP`, async ({ browser }) => {
      // Create new incognito context (zero cache)
      const context = await browser.newContext({
        viewport: { width: 412, height: 915 },
        userAgent: "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        isMobile: true,
        hasTouch: true
      });

      const page = await context.newPage();
      await page.addInitScript(vitalsInitScript);

      const navStart = Date.now();
      const response = await page.goto(PDP_URL, { waitUntil: "load", timeout: 45000 });
      await page.waitForTimeout(1500);

      const data = await page.evaluate(() => {
        const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
        const paints = performance.getEntriesByType("paint");
        const fcp = paints.find((p) => p.name === "first-contentful-paint");

        return {
          ttfbMs: nav ? Math.round(nav.responseStart - nav.requestStart) : 0,
          fcpMs: fcp ? Math.round(fcp.startTime) : 0,
          lcpMs: Math.round((window as any).__gateMetrics?.lcp || 0),
          cls: Number(((window as any).__gateMetrics?.cls || 0).toFixed(4)),
          lcpElement: (window as any).__gateMetrics?.lcpElement,
          lcpElementClass: (window as any).__gateMetrics?.lcpElementClass,
          lcpUrl: (window as any).__gateMetrics?.lcpUrl,
          lcpSize: (window as any).__gateMetrics?.lcpSize,
          status: nav ? 200 : 0
        };
      });

      console.log(`[COLD_RUN_${i}]`, JSON.stringify(data));
      expect(response?.status()).toBe(200);
      expect(data.lcpMs).toBeLessThan(2500);
      await context.close();
    });
  }

  // 5 Warm runs: single context navigating repeatedly
  test("5 Warm Runs — Mobile PDP (reusing session cache)", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 412, height: 915 },
      userAgent: "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
      isMobile: true,
      hasTouch: true
    });

    const page = await context.newPage();

    // Initial prime load
    await page.goto(PDP_URL, { waitUntil: "load" });
    await page.waitForTimeout(1000);

    for (let i = 1; i <= 5; i++) {
      await page.addInitScript(vitalsInitScript);
      await page.goto(PDP_URL, { waitUntil: "load", timeout: 45000 });
      await page.waitForTimeout(1000);

      const data = await page.evaluate(() => {
        const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
        const paints = performance.getEntriesByType("paint");
        const fcp = paints.find((p) => p.name === "first-contentful-paint");

        return {
          ttfbMs: nav ? Math.round(nav.responseStart - nav.requestStart) : 0,
          fcpMs: fcp ? Math.round(fcp.startTime) : 0,
          lcpMs: Math.round((window as any).__gateMetrics?.lcp || 0),
          cls: Number(((window as any).__gateMetrics?.cls || 0).toFixed(4)),
          lcpElement: (window as any).__gateMetrics?.lcpElement,
          lcpElementClass: (window as any).__gateMetrics?.lcpElementClass,
          lcpUrl: (window as any).__gateMetrics?.lcpUrl,
          lcpSize: (window as any).__gateMetrics?.lcpSize
        };
      });

      console.log(`[WARM_RUN_${i}]`, JSON.stringify(data));
      expect(data.lcpMs).toBeLessThan(2500);
    }

    await context.close();
  });
});

test.describe("Release-Gate: Throttled Mobile Network & CPU Performance", () => {
  test.setTimeout(60000);
  const routes = [
    { name: "Homepage", url: "/" },
    { name: "Catalog", url: "/shop" },
    { name: "PDP", url: PDP_URL },
    { name: "Cart", url: "/cart" },
    { name: "Checkout", url: "/checkout" }
  ];

  for (const r of routes) {
    test(`Throttled Mobile (Slow 4G / 4x CPU proxy) — ${r.name}`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: 412, height: 915 },
        isMobile: true,
        hasTouch: true
      });
      const page = await context.newPage();

      // Enable CDP throttling if supported (Chromium)
      try {
        const cdp = await context.newCDPSession(page);
        await cdp.send("Network.emulateNetworkConditions", {
          offline: false,
          downloadThroughput: (1.5 * 1024 * 1024) / 8, // 1.5 Mbps (Fast 3G / Slow 4G)
          uploadThroughput: (750 * 1024) / 8, // 750 Kbps
          latency: 80 // 80ms RTT
        });
        await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 }); // 4x slowdown
      } catch (e) {
        // Fallback if not chromium cdp
      }

      await page.addInitScript(() => {
        (window as any).__throttledMetrics = { lcp: 0, cls: 0 };
        try {
          const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) (window as any).__throttledMetrics.lcp = lastEntry.startTime;
          });
          lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
        } catch (e) {}

        try {
          let clsVal = 0;
          const clsObserver = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries() as any[]) {
              if (!entry.hadRecentInput) clsVal += entry.value;
            }
            (window as any).__throttledMetrics.cls = clsVal;
          });
          clsObserver.observe({ type: "layout-shift", buffered: true });
        } catch (e) {}
      });

      const start = Date.now();
      await page.goto(r.url, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.waitForTimeout(3000);

      // Measure simulated interaction latency (INP proxy)
      let interactionProxyMs: number | null = null;
      try {
        const actionBtn = page.locator("button, a").filter({ visible: true }).first();
        if (await actionBtn.count() > 0) {
          const t0 = Date.now();
          await actionBtn.hover({ timeout: 2000 });
          interactionProxyMs = Date.now() - t0;
        }
      } catch (e) {}

      const metrics = await page.evaluate((proxy) => {
        const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
        const paints = performance.getEntriesByType("paint");
        const fcp = paints.find((p) => p.name === "first-contentful-paint");

        return {
          ttfbMs: nav ? Math.round(nav.responseStart - nav.requestStart) : 0,
          fcpMs: fcp ? Math.round(fcp.startTime) : 0,
          lcpMs: Math.round((window as any).__throttledMetrics?.lcp || 0),
          cls: Number(((window as any).__throttledMetrics?.cls || 0).toFixed(4)),
          simulatedInteractionProxyMs: proxy
        };
      }, interactionProxyMs);

      console.log(`[THROTTLED_MOBILE][${r.name}]`, JSON.stringify(metrics));
      await context.close();
    });
  }
});
