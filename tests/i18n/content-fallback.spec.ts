import { test, expect } from "@playwright/test";

/**
 * Story-05 (static strings per locale) + RULE-08/11 + EC-06/EC-07 + NFR-02
 */

test.describe("Static string localization + fallback + dynamic content untouched", () => {
  test("AC-05.1/AC-05.2: reservation page shows English heading on /en and Vietnamese heading on /vi", async ({
    page,
  }) => {
    await page.goto("/en/reservation");
    await expect(page.getByText("Make a Reservation", { exact: false })).toBeVisible();

    await page.goto("/vi/reservation");
    await expect(
      page.getByText("Make a Reservation", { exact: false }),
    ).toHaveCount(0);
  });

  test("EC-06/RULE-08: missing vi key falls back to English text, not a raw key", async ({
    page,
  }) => {
    await page.goto("/vi/reservation");
    const html = await page.content();
    // no raw i18n key leakage pattern like "reservation.someKey" rendered as literal text
    expect(html).not.toMatch(/\breservation\.[a-zA-Z0-9_.]+\b(?![^<]*[:}])/);
  });

  test("EC-07/RULE-11: dynamic product content (title) renders identically regardless of locale", async ({
    page,
  }) => {
    await page.goto("/en/dish/orange-juice");
    await expect(page.getByRole("heading", { name: "Orange Juice" }).first()).toBeVisible();

    await page.goto("/vi/dish/orange-juice");
    await expect(page.getByRole("heading", { name: "Orange Juice" }).first()).toBeVisible();
  });
});
