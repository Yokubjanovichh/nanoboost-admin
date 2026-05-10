import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || "admin@nanoboost.io";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || "ChangeMeImmediately123!";

test.describe("Auth flow (smoke)", () => {
  test("renders login page in Russian", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Вход в админ-панель" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Пароль")).toBeVisible();
    await expect(page.getByRole("button", { name: "Войти" })).toBeVisible();
  });

  test("shows validation errors for empty submit", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Войти" }).click();
    await expect(page.getByRole("alert").first()).toContainText(/обязателен/i);
  });

  test("redirects to /dashboard after successful login", async ({ page }) => {
    test.skip(
      !process.env.E2E_RUN_BACKEND_TESTS,
      "Set E2E_RUN_BACKEND_TESTS=1 with a running backend to enable.",
    );
    await page.goto("/login");
    await page.getByLabel("Email").fill(ADMIN_EMAIL);
    await page.getByLabel("Пароль").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Войти" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Дашборд" })).toBeVisible();
  });
});
