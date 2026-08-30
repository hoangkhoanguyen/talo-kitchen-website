import { test, expect } from "@playwright/test";

/**
 * Story-02 (URL reflects language) + Story-04 (<html lang>) + RULE-01/02/05/06
 * AC-02.1, AC-02.2, AC-02.3, AC-04.1, AC-04.2, AC-04.3, EC-01, EC-03, EC-12
 */

test.describe("Routing / locale prefix", () => {
  test("AC-02.1/EC-01: '/' with no cookie/Accept-Language redirects to default locale /en", async ({
    request,
  }) => {
    const res = await request.get("/", {
      maxRedirects: 0,
      headers: { "Accept-Language": "" },
    });
    expect(res.status()).toBe(307);
    expect(res.headers()["location"]).toMatch(/\/en$/);
  });

  test("AC-02.1: unlocalized path redirects to locale-prefixed path, preserving rest of path", async ({
    request,
  }) => {
    const res = await request.get("/dish/orange-juice", { maxRedirects: 0 });
    expect(res.status()).toBe(307);
    expect(res.headers()["location"]).toMatch(/\/en\/dish\/orange-juice$/);
  });

  test("AC-02.2: '/en/menu/all' renders English, no redirect (200)", async ({
    page,
  }) => {
    const res = await page.goto("/en/menu/all");
    expect(res?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("AC-02.3/AC-04.1: '/vi/menu/all' renders with Vietnamese <html lang>", async ({
    page,
  }) => {
    const res = await page.goto("/vi/menu/all");
    expect(res?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  });

  test("AC-04.2/AC-04.3: '/en/...' has <html lang='en'>, no hardcoded lang left over", async ({
    page,
  }) => {
    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  const subRoutes = [
    "/en/menu",
    "/en/menu/all",
    "/en/dish/orange-juice",
    "/en/reservation",
    "/en/checkout",
    "/en/cart",
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
