import { test, expect } from "@playwright/test";

test.describe("Admin & Auth flows — End-to-End User Actions", () => {
  test("admin login page renders inputs and rejects invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { level: 1 }).or(page.locator("h1"))).toBeVisible();

    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // User action: Fill bad credentials and attempt sign-in
    await emailInput.fill("nonexistent-admin@elaris.internal");
    await passwordInput.fill("wrongpassword123");

    const submitBtn = page.locator("button[type='submit']").first();
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Verify page displays error or prevents unauthorized entry
    await expect(page).not.toHaveURL(/\/admin$/);
  });

  test("unauthenticated access to /admin presents lock screen or redirects", async ({ page }) => {
    await page.goto("/admin");
    // Should show lock screen or redirect away from admin dashboard content
    const lockScreenOrHeading = page.locator("text=/Access Restricted|Sign In|Unauthorized|Admin/i").first();
    await expect(lockScreenOrHeading).toBeVisible();
  });

  test("admin products API requires authentication", async ({ request }) => {
    const response = await request.get("/api/admin/products");
    expect(response.status()).toBe(401);
  });

  test("admin orders status API requires authentication", async ({ request }) => {
    const response = await request.patch("/api/admin/orders/fake-id/status", {
      data: { newStatus: "CONFIRMED" }
    });
    expect(response.status()).toBe(401);
  });

  test("cart API validates variantId parameter on POST", async ({ request }) => {
    const response = await request.post("/api/cart", {
      data: { variantId: "", quantity: 1 }
    });
    expect(response.status()).toBe(422);
  });

  test("orders API rejects empty request body", async ({ request }) => {
    const response = await request.post("/api/orders", {
      data: {}
    });
    expect(response.status()).toBe(422);
  });
});
