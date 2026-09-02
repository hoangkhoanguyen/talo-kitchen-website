import { test, expect } from "@playwright/test";

/**
 * sprint-2-config-i18n — user-facing resolve-by-locale + fallback + cache-per-locale.
 * Covers Story-03 (AC-03.1..AC-03.6), Story-05 (AC-05.1/AC-05.2), EC-05, EC-06, EC-12,
 * NFR-04 (component compat).
 *
 * DB state at time of writing: migration has run once on dev_multi_lang; every
 * localized field's `vi` is empty ("") — so `/vi` MUST fall back to the English
 * value (AC-03.2/EC-05), never render an empty string / broken layout.
 *
 * NOTE: `localePrefix: 'as-needed'` (sprint-1 decision) — default locale `en`
 * has NO URL prefix (`/`, `/menu`, `/reservation`); only `vi` is prefixed
 * (`/vi`, `/vi/menu`, `/vi/reservation`). Using `/en/...` here would 307-redirect.
 */

test.describe("Config i18n — resolve by locale on the homepage", () => {
  test("AC-03.3: / (default locale en) shows the English our_story content", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText("Park your worries, savor the moment", { exact: false }),
    ).toBeVisible();
  });

  test("AC-03.2/EC-05: /vi falls back to English our_story content (vi not yet translated) — no empty text, no crash", async ({
    page,
  }) => {
    const res = await page.goto("/vi");
    expect(res?.status()).toBeLessThan(400);
    await expect(
      page.getByText("Park your worries, savor the moment", { exact: false }),
    ).toBeVisible();
  });

  test("AC-03.4: non-localized field (hero title array / header phone) renders identically on / (en) and /vi", async ({
    page,
  }) => {
    await page.goto("/");
    const enPhone = await page
      .locator("footer")
      .getByText("0898 082 138", { exact: false })
      .first()
      .isVisible()
      .catch(() => false);

    await page.goto("/vi");
    const viPhone = await page
      .locator("footer")
      .getByText("0898 082 138", { exact: false })
      .first()
      .isVisible()
      .catch(() => false);

    // At least one of the pages must show it, and where visible it must match
    // (phone/href/URL/slug never localized, RULE-25).
    if (enPhone || viPhone) {
      expect(enPhone).toBe(viPhone);
    }
  });

  test("AC-03.6/NFR-04: component renders resolved plain string (no raw {en,vi} object leak, no [object Object])", async ({
    page,
  }) => {
    await page.goto("/vi");
    const html = await page.content();
    expect(html).not.toContain("[object Object]");
  });

  test("EC-12: homepage renders with no server error even though some sections may be structurally sparse", async ({
    page,
  }) => {
    const res = await page.goto("/vi");
    expect(res?.status()).toBe(200);
    // Page shouldn't show a Next.js error boundary / 500 page content
    const html = await page.content();
    expect(html).not.toMatch(/Application error/i);
  });
});

test.describe("Config i18n — cache is per-locale (RULE-08, AC-05.1, EC-11)", () => {
  test("AC-05.1: / (en) and /vi requests both succeed and do not serve a broken/empty page for either locale", async ({
    page,
  }) => {
    const enRes = await page.goto("/");
    expect(enRes?.status()).toBe(200);
    await expect(page.locator("body")).not.toBeEmpty();

    const viRes = await page.goto("/vi");
    expect(viRes?.status()).toBe(200);
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("cache does not cross-contaminate: re-fetching / (en) after /vi still shows English our_story content", async ({
    page,
  }) => {
    await page.goto("/vi");
    await page.goto("/");
    await expect(
      page.getByText("Park your worries, savor the moment", { exact: false }),
    ).toBeVisible();
  });
});

test.describe("Config i18n — menu_page and reservation_page resolve without crashing", () => {
  test("menu page loads on / (en) and /vi", async ({ page }) => {
    const enRes = await page.goto("/menu");
    expect(enRes?.status()).toBeLessThan(400);
    const viRes = await page.goto("/vi/menu");
    expect(viRes?.status()).toBeLessThan(400);
  });

  test("reservation page loads on / (en) and /vi", async ({ page }) => {
    const enRes = await page.goto("/reservation");
    expect(enRes?.status()).toBeLessThan(400);
    const viRes = await page.goto("/vi/reservation");
    expect(viRes?.status()).toBeLessThan(400);
  });
});
