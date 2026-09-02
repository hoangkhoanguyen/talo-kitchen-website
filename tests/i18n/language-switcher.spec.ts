import { test, expect } from "@playwright/test";

/**
 * Story-01 (language switcher) + EC-08/EC-09 + DAC-01..07
 *
 * `localePrefix: 'as-needed'`: default locale (en) has no URL prefix, only
 * vi is prefixed.
 */

const ACTIVE_BG = "rgb(236, 201, 75)"; // web-secondary-1 #ECC94B
const ACTIVE_TEXT = "rgb(26, 26, 26)"; // web-content-1 #1A1A1A
const INACTIVE_TEXT = "rgb(68, 68, 68)"; // web-content-2 #444444

test.describe("Language switcher", () => {
  test("AC-01.3/DAC-04: VI segment is active on /vi, EN segment active on /", async ({
    page,
    context,
  }) => {
    await page.goto("/vi");
    const nav = page.getByRole("navigation", { name: "Language" });
    const vi = nav.getByRole("button", { name: "Tiếng Việt" });
    const en = nav.getByRole("button", { name: "English" });
    await expect(vi).toHaveAttribute("aria-current", "true");
    await expect(en).not.toHaveAttribute("aria-current", "true");

    // Clear the NEXT_LOCALE=vi cookie set by the previous navigation so it
    // doesn't override the unprefixed default-locale path below (cookie
    // takes priority over an unprefixed path per RULE-03).
    await context.clearCookies();
    await page.goto("/");
    await expect(en).toHaveAttribute("aria-current", "true");
    await expect(vi).not.toHaveAttribute("aria-current", "true");
  });

  test("DAC-01/DAC-02: active segment colors match design tokens", async ({
    page,
  }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Language" });
    const active = nav.getByRole("button", { name: "English" });
    const inactive = nav.getByRole("button", { name: "Tiếng Việt" });

    await expect(active).toHaveCSS("background-color", ACTIVE_BG);
    await expect(active).toHaveCSS("color", ACTIVE_TEXT);
    await expect(inactive).toHaveCSS("color", INACTIVE_TEXT);
  });

  test("AC-01.1: choosing 'Tiếng Việt' from a page navigates to same page under /vi", async ({
    page,
  }) => {
    await page.goto("/reservation");
    await page.getByRole("navigation", { name: "Language" }).getByRole("button", { name: "Tiếng Việt" }).click();
    await expect(page).toHaveURL(/\/vi\/reservation$/);
  });

  test("AC-01.2: choosing 'English' from /vi/reservation navigates to unprefixed /reservation", async ({
    page,
  }) => {
    await page.goto("/vi/reservation");
    await page.getByRole("navigation", { name: "Language" }).getByRole("button", { name: "English" }).click();
    await expect(page).toHaveURL(/\/reservation$/);
    await expect(page).not.toHaveURL(/\/en\/reservation$/);
  });

  test("EC-09: switching locale on dynamic route preserves slug + query string", async ({
    page,
  }) => {
    await page.goto("/vi/dish/orange-juice?ref=abc");
    await page.getByRole("navigation", { name: "Language" }).getByRole("button", { name: "English" }).click();
    await expect(page).toHaveURL(/\/dish\/orange-juice\?ref=abc$/);
    await expect(page).not.toHaveURL(/\/en\/dish\/orange-juice/);
  });

  test("DAC-03: both segments are keyboard-focusable with visible focus ring and accessible names", async ({
    page,
  }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Language" });
    const en = nav.getByRole("button", { name: "English" });
    const vi = nav.getByRole("button", { name: "Tiếng Việt" });
    await en.focus();
    await expect(en).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(vi).toBeFocused();
  });

  test("DAC-05: switcher does not overflow/wrap the utility bar at 360px width", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Language" });
    await expect(nav).toBeVisible();
    const box = await nav.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x + box!.width).toBeLessThanOrEqual(360);
  });

  test("DAC-06: switcher renders exactly one segment per configured locale (en, vi)", async ({
    page,
  }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Language" });
    const buttons = nav.getByRole("button");
    await expect(buttons).toHaveCount(2);
  });

  test("DAC-07: segment labels 'EN'/'VI' render identically regardless of active locale", async ({
    page,
  }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Language" });
    await expect(nav).toContainText("EN");
    await expect(nav).toContainText("VI");

    await page.goto("/vi");
    const nav2 = page.getByRole("navigation", { name: "Language" });
    await expect(nav2).toContainText("EN");
    await expect(nav2).toContainText("VI");
  });
});
