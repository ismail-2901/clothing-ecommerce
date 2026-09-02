import { expect, test } from "@playwright/test";

test("homepage exposes the primary shopping path", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /sharper way to shop/i })).toBeVisible();
  await page.getByRole("link", { name: /shop the collection/i }).click();
  await expect(page).toHaveURL(/\/shop/);
});
