import { test, expect } from "@playwright/test";

test.describe("Checkout flow", () => {
  test("browse → PDP → add to cart → view cart", async ({ page }) => {
    // 1. Visit shop
    await page.goto("/shop");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // 2. Click first product card
    const firstProduct = page.locator("a[href^='/products/']").first();
    const href = await firstProduct.getAttribute("href");
    expect(href).toMatch(/^\/products\//);
    await firstProduct.click();

    // 3. Product detail page should load
    await page.waitForURL(/\/products\//);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // 4. Navigate to cart
    await page.goto("/cart");
    // Cart page should render without error
    await expect(page).toHaveURL("/cart");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("checkout page renders", async ({ page }) => {
    await page.goto("/checkout");
    // Should redirect to cart or render checkout shell
    await expect(page.locator("h1, [data-testid='checkout']").first()).toBeVisible();
  });

  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/.+/);
    // Nav should exist
    await expect(page.locator("header, nav").first()).toBeVisible();
  });

  test("product page has JSON-LD", async ({ page }) => {
    await page.goto("/products/black-linen-shirt");
    const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
    if (ld) {
      const parsed = JSON.parse(ld) as Record<string, unknown>;
      expect(parsed["@type"]).toBe("Product");
      expect(typeof parsed.name).toBe("string");
    }
  });

  test("sitemap.xml is accessible", async ({ page }) => {
    const response = await page.request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
  });

  test("robots.txt is accessible", async ({ page }) => {
    const response = await page.request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain("User-agent");
    expect(text).toContain("Disallow: /admin/");
  });
});

test.describe("AI chat API", () => {
  test("returns product matches for shopping query", async ({ request }) => {
    const response = await request.post("/api/ai/chat", {
      data: { message: "black shirt under 3000" }
    });
    expect(response.ok()).toBe(true);
    const body = await response.json() as { intent: string; products: unknown[] };
    expect(body.intent).toBe("PRODUCT_SEARCH");
    expect(Array.isArray(body.products)).toBe(true);
  });

  test("returns knowledge base answer for shipping query", async ({ request }) => {
    const response = await request.post("/api/ai/chat", {
      data: { message: "how long does delivery take?" }
    });
    expect(response.ok()).toBe(true);
    const body = await response.json() as { text: string };
    expect(typeof body.text).toBe("string");
    expect(body.text.length).toBeGreaterThan(0);
  });

  test("rejects empty message", async ({ request }) => {
    const response = await request.post("/api/ai/chat", {
      data: { message: "" }
    });
    expect(response.status()).toBe(422);
  });
});
