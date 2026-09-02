import { test, expect } from "@playwright/test";
import { config as loadEnv } from "dotenv";
import { SignJWT } from "jose";
import path from "node:path";

loadEnv({ path: ".env.local" });

/**
 * design-fidelity skill — visual baseline capture for sprint-3-entity-i18n
 * admin LocaleTabStrip screens (product edit page + category edit modal),
 * smallest (360px) and largest (1440px) breakpoints, EN tab and VI tab
 * active. Admin theme is light-only (no dark mode toggle in this admin),
 * matching sprint-2's admin-localized-field-*.png baseline convention.
 *
 * Baselines written to .sdlc/v1/sprint-3-entity-i18n/visual-baseline/.
 */

const OUT_DIR = path.resolve(
  __dirname,
  "..",
  "..",
  ".sdlc",
  "v1",
  "sprint-3-entity-i18n",
  "visual-baseline",
);

const ADMIN_USER_ID = Number(process.env.QA_ADMIN_USER_ID ?? 4);
const ADMIN_USERNAME = process.env.QA_ADMIN_USER ?? "hungadmin";
const ADMIN_EMAIL = process.env.QA_ADMIN_EMAIL ?? "zearth113@gmail.com";
const PRODUCT_ID = 18;

const breakpoints = [
  { name: "mobile-360", width: 360, height: 900 },
  { name: "desktop-1440", width: 1440, height: 1000 },
];

async function login(page: import("@playwright/test").Page) {
  const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_JWT_SECRET);
  const token = await new SignJWT({
    userId: ADMIN_USER_ID,
    email: ADMIN_EMAIL,
    username: ADMIN_USERNAME,
    firstName: "QA",
    lastName: "Tester",
    role: "admin",
    isActive: true,
    tokenType: "access",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30m")
    .sign(secret);

  await page.goto("/admin/login");
  await page.context().addCookies([
    {
      name: "access_token",
      value: token,
      url: page.url(),
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);
  await page.goto("/admin/dashboard");
  await expect(page).not.toHaveURL(/\/admin\/login/);
}

test.describe("Visual baseline capture — sprint-3 admin LocaleTabStrip", () => {
  for (const bp of breakpoints) {
    test(`product edit page — EN tab active @ ${bp.name}`, async ({ page }) => {
      await login(page);
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto(`/admin/products/${PRODUCT_ID}`);
      const card = page.locator("div.card", { hasText: "Thông tin cơ bản" });
      await expect(card.getByRole("tablist").first()).toBeVisible();
      await expect(card.locator("input").first()).not.toHaveValue("");
      await page.screenshot({
        path: path.join(OUT_DIR, `product-edit-en-${bp.name}.png`),
        fullPage: true,
      });
    });

    test(`product edit page — VI tab active (badge visible) @ ${bp.name}`, async ({
      page,
    }) => {
      await login(page);
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto(`/admin/products/${PRODUCT_ID}`);
      const card = page.locator("div.card", { hasText: "Thông tin cơ bản" });
      const tablist = card.getByRole("tablist").first();
      await expect(tablist).toBeVisible();
      await expect(card.locator("input").first()).not.toHaveValue("");
      await tablist.getByRole("tab", { name: /Tiếng Việt/ }).click();
      await page.screenshot({
        path: path.join(OUT_DIR, `product-edit-vi-${bp.name}.png`),
        fullPage: true,
      });
    });

    test(`category edit modal (UpdateCategory) — EN/VI tabs @ ${bp.name}`, async ({
      page,
    }) => {
      await login(page);
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto("/admin/categories");
      const firstRow = page.locator("table tbody tr").first();
      await expect(firstRow).toBeVisible();
      await firstRow.locator("button").first().click();
      const modal = page
        .locator("div.card")
        .filter({ has: page.getByRole("tablist") })
        .first();
      await expect(modal.getByRole("tablist")).toBeVisible();
      await page.screenshot({
        path: path.join(OUT_DIR, `category-edit-en-${bp.name}.png`),
        fullPage: true,
      });

      await modal.getByRole("tablist").getByRole("tab", { name: /Tiếng Việt/ }).click();
      await page.screenshot({
        path: path.join(OUT_DIR, `category-edit-vi-${bp.name}.png`),
        fullPage: true,
      });
    });
  }
});
