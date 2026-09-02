import { test, expect } from "@playwright/test";

/**
 * Story-02 (URL reflects language) + Story-04 (<html lang>) + RULE-01/02/05/06
 * AC-02.1, AC-02.2, AC-02.3, AC-04.1, AC-04.2, AC-04.3, EC-01, EC-03, EC-12
 *
 * `localePrefix: 'as-needed'`: default locale (en) has NO prefix in the URL,
 * only the non-default locale (vi) is prefixed.
 */

test.describe("Routing / locale prefix", () => {
  test("AC-02.1/EC-01: '/' with no cookie/Accept-Language renders default locale en directly, no redirect", async ({
    request,
  }) => {
    const res = await request.get("/", {
      maxRedirects: 0,
      headers: { "Accept-Language": "" },
    });
    expect(res.status()).toBe(200);
  });

  test("AC-02.1: unlocalized path renders English directly (no redirect, default locale has no prefix)", async ({
    page,
  }) => {
    const res = await page.goto("/dish/orange-juice");
    expect(res?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("AC-02.2: '/menu/all' renders English with no locale prefix (200)", async ({
    page,
  }) => {
    const res = await page.goto("/menu/all");
    expect(res?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("as-needed: '/en/menu/all' (redundant default-locale prefix) redirects to unprefixed '/menu/all'", async ({
    request,
  }) => {
    const res = await request.get("/en/menu/all", { maxRedirects: 0 });
    expect(res.status()).toBe(307);
    expect(res.headers()["location"]).toBe("/menu/all");
  });

  test("AC-02.3/AC-04.1: '/vi/menu/all' renders with Vietnamese <html lang>", async ({
    page,
  }) => {
    const res = await page.goto("/vi/menu/all");
    expect(res?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  });

  test("AC-04.2/AC-04.3: '/' has <html lang='en'>, no hardcoded lang left over", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  const subRoutes = [
    "/menu/all",
    "/dish/orange-juice",
    "/reservation",
    "/checkout",
    "/cart",
    "/vi/menu/all",
    "/vi/dish/orange-juice",
    "/vi/reservation",
    "/vi/checkout",
    "/vi/cart",
  ];
  for (const route of subRoutes) {
    test(`RI-03: sub-route ${route} is reachable (200 after redirects)`, async ({
      page,
    }) => {
      const res = await page.goto(route);
      expect(res?.status()).toBe(200);
    });
  }

  test("EC-03/RULE-05: invalid locale '/fr/...' ends in 404, not a crash/loop", async ({
    request,
  }) => {
    const res = await request.get("/fr/dish/x", { maxRedirects: 5 });
    expect(res.status()).toBe(404);
  });

  test("EC-03: invalid locale root '/fr' ends in 404", async ({ request }) => {
    const res = await request.get("/fr", { maxRedirects: 5 });
    expect(res.status()).toBe(404);
  });
});
