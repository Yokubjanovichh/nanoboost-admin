import { test, expect } from "@playwright/test";

test.describe("App shell smoke tests", () => {
  test("redirects unauthenticated user from / to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("404 page renders for unknown route", async ({ page }) => {
    await page.goto("/this-does-not-exist");
    await expect(page.getByRole("heading", { name: "Страница не найдена" })).toBeVisible();
    await expect(page.getByRole("link", { name: "На главную" })).toBeVisible();
  });

  test("login page is keyboard accessible", async ({ page }) => {
    await page.goto("/login");
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => document.activeElement?.getAttribute("type"));
    expect(["email", "text"]).toContain(focused);
  });
});
