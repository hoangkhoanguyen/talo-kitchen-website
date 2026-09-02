import { test, expect } from "@playwright/test";

/**
 * Story-03 (remember locale) + RULE-03/04, EC-01, EC-02, AC-03.1..4
 *
 * `localePrefix: 'as-needed'`: an explicit default-locale prefix ('/en/...')
 * is first normalized away (redirected to the unprefixed path) by next-intl
 * BEFORE cookie/Accept-Language detection runs on the resulting unprefixed
 * path. That normalizing redirect itself sets `Set-Cookie: NEXT_LOCALE=en`,
 * which a real browser honors for the follow-up request — so an explicit
 * '/en/...' path effectively still wins and ends up rendering en, even with
 * a stale NEXT_LOCALE=vi cookie (confirmed via real server/browser behavior
 * below). Non-default locale prefixes (e.g. '/vi/...') are never stripped,
 * so they always win outright.
 */

test.describe("Locale detection priority: path > cookie > Accept-Language > default", () => {
  test("EC-02/RULE-03: explicit '/vi/...' path wins over cookie=en, renders vi, no redirect", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    await context.addCookies([
      {
        name: "NEXT_LOCALE",
        value: "en",
        url: "http://localhost:3100",
      },
    ]);
    const page = await context.newPage();
    const res = await page.goto("/vi/menu/all");
    expect(res?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "vi");
    await context.close();
  });

  test("as-needed: redundant default-locale path '/en/menu/all' is normalized to '/menu/all' and its own Set-Cookie:en overrides a stale cookie=vi mid-redirect, ending on en", async ({
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
    // The redirect stripping the redundant '/en' prefix itself responds with
    // `Set-Cookie: NEXT_LOCALE=en`, so the browser follows up on the
    // unprefixed path with the updated (not the original) cookie value.
    await expect(page).toHaveURL(/\/menu\/all$/);
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

  test("AC-03.3: Accept-Language with no vi/en match => renders default locale en directly, no redirect", async ({
    request,
  }) => {
    const res = await request.get("/", {
      maxRedirects: 0,
      headers: { "Accept-Language": "fr-FR,fr;q=0.9,de;q=0.8" },
    });
    expect(res.status()).toBe(200);
  });
});
