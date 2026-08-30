import { test, expect } from "@playwright/test";

/**
 * Story-03 (remember locale) + RULE-03/04, EC-01, EC-02, AC-03.1..4
 */

test.describe("Locale detection priority: path > cookie > Accept-Language > default", () => {
  test("EC-02/RULE-03: cookie=vi but path is /en/... => path wins, renders en, no redirect", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    await context.addCookies([
      {
        name: "NEXT_LOCALE",
        value: "vi",
        url: "http://localhost:3100",
      },
    ]);
    const page = await context.newPage();
    const res = await page.goto("/en/menu/all");
    expect(res?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await context.close();
  });

  test("AC-03.1: cookie NEXT_LOCALE=vi + no locale in path => redirects to /vi and stays vi on refresh", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    await context.addCookies([
      {
        name: "NEXT_LOCALE",
        value: "vi",
        url: "http://localhost:3100",
      },
    ]);
    const page = await context.newPage();
    await page.goto("/");
    await expect(page).toHaveURL(/\/vi$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "vi");

    // EC-10: refresh keeps locale (no flash back to en)
    await page.reload();
    await expect(page).toHaveURL(/\/vi$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "vi");
    await context.close();
  });

  test("AC-03.2: Accept-Language: vi, no cookie, path '/' => redirects to /vi", async ({
    request,
  }) => {
    const res = await request.get("/", {
      maxRedirects: 0,
      headers: { "Accept-Language": "vi,vi-VN;q=0.9" },
    });
    expect(res.status()).toBe(307);
    expect(res.headers()["location"]).toMatch(/\/vi$/);
  });

  test("AC-03.3: Accept-Language with no vi/en match => redirects to default /en", async ({
    request,
  }) => {
    const res = await request.get("/", {
      maxRedirects: 0,
      headers: { "Accept-Language": "fr-FR,fr;q=0.9,de;q=0.8" },
    });
    expect(res.status()).toBe(307);
    expect(res.headers()["location"]).toMatch(/\/en$/);
  });
});
