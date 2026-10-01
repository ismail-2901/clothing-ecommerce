import { expect, test } from "@playwright/test";

test("homepage exposes the primary shopping path", async ({ page }) => {
  await page.goto("/");
  // The HeroSlider renders one of several headlines depending on the active slide.
  // Assert the <h1> is visible (any content) — the hero section always has one.
  const heroH1 = page.locator("section.elaris-hero h1").first();
  await expect(heroH1).toBeVisible();

  // The hero slide CTA link always reads "Shop New In" → /shop
  const shopLink = page.locator("a[href='/shop'], a[href^='/shop?']").filter({ visible: true }).first();
  await expect(shopLink).toBeVisible();
  await shopLink.click();
  await expect(page).toHaveURL(/\/shop/);
});
