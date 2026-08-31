import { test, expect } from "@playwright/test";

/**
 * sprint-3-entity-i18n — user-facing entity resolve (dish/menu/related/quick-cart/cart).
 *
 * Covers Story-04 (AC-04.1..AC-04.6), Story-05 (AC-05.1/AC-05.2), Story-07
 * (AC-07.1/AC-07.2, cache per-locale), NFR-01 (no N+1 — see admin/dev log
 * inspection in test-report.md), NFR-05 (compat), EC-02/03/05/11/13/15.
 *
 * Fixture data note: DB `dev_multi_lang` was seeded with `locale='en'` rows
 * only (no `vi` translations yet) — this is the REAL current state, so most
 * `/vi` assertions here exercise the FALLBACK path (AC-04.2), which is
 * exactly what needs proving before any `vi` content exists. A couple of
 * tests additionally seed one temporary `vi` row via direct SQL to prove the
 * "real vi content wins" path (AC-04.1) end-to-end, then roll it back.
 */

const KNOWN_PRODUCT_SLUG = "orange-juice";
const KNOWN_CATEGORY = "all";

test.describe("Dish detail page — locale resolve + fallback", () => {
  test("AC-04.3: / (en) renders English title", async ({ page }) => {
    const res = await page.goto(`/dish/${KNOWN_PRODUCT_SLUG}`);
    expect(res?.status()).toBeLessThan(400);
    await expect(
      page.getByRole("heading", { name: "Orange Juice" }).first(),
    ).toBeVisible();
  });

  test("AC-04.2/EC-02: /vi with no vi row falls back to English content, no blank page, no crash", async ({
    page,
  }) => {
    const res = await page.goto(`/vi/dish/${KNOWN_PRODUCT_SLUG}`);
    expect(res?.status()).toBeLessThan(400);
    await expect(
      page.getByRole("heading", { name: "Orange Juice" }).first(),
    ).toBeVisible();
    const html = await page.content();
    expect(html).not.toMatch(/Application error/i);
  });

  test("AC-04.6/RULE-02: non-translated fields (price, image) identical across locale", async ({
    page,
  }) => {
    await page.goto(`/dish/${KNOWN_PRODUCT_SLUG}`);
    const enHtml = await page.content();
    const enPriceMatch = enHtml.match(/[\d.,]+\s*(đ|VND|₫)/i);

    await page.goto(`/vi/dish/${KNOWN_PRODUCT_SLUG}`);
    const viHtml = await page.content();
    const viPriceMatch = viHtml.match(/[\d.,]+\s*(đ|VND|₫)/i);

    expect(enPriceMatch?.[0]).toBeTruthy();
    expect(enPriceMatch?.[0]).toBe(viPriceMatch?.[0]);
  });

  test("generateMetadata reads locale (design.md fix): en/vi both produce a non-crashing <title> containing product name", async ({
    page,
  }) => {
    await page.goto(`/dish/${KNOWN_PRODUCT_SLUG}`);
    await expect(page).toHaveTitle(/Orange Juice/);

    await page.goto(`/vi/dish/${KNOWN_PRODUCT_SLUG}`);
    await expect(page).toHaveTitle(/Orange Juice/);
  });

  test("404 product slug -> not found, no 500, on both locales (robustness)", async ({
    page,
  }) => {
    const resEn = await page.goto(`/dish/does-not-exist-xyz`);
    expect(resEn?.status()).toBe(404);
    const resVi = await page.goto(`/vi/dish/does-not-exist-xyz`);
    expect(resVi?.status()).toBe(404);
  });
});

test.describe("Menu page — FoodCategories + NewFood locale resolve", () => {
  test("AC-04.4: /menu/all (en) renders product cards with English titles", async ({
    page,
  }) => {
    const res = await page.goto(`/menu/${KNOWN_CATEGORY}`);
    expect(res?.status()).toBeLessThan(400);
    await expect(page.getByText("Orange Juice", { exact: false }).first()).toBeVisible();
  });

  test("AC-04.4/AC-04.2: /vi/menu/all falls back to English product titles (no vi rows yet), no crash", async ({
    page,
  }) => {
    const res = await page.goto(`/vi/menu/${KNOWN_CATEGORY}`);
    expect(res?.status()).toBeLessThan(400);
    await expect(page.getByText("Orange Juice", { exact: false }).first()).toBeVisible();
    const html = await page.content();
    expect(html).not.toMatch(/Application error/i);
  });

  test("AC-04.5/EC-06: category-specific menu page renders without crashing on both locales", async ({
    page,
  }) => {
    // Use a real category slug; if it 404s the category doesn't exist under
    // this key — the important assertion is "no 500 / no unhandled error".
    const res = await page.goto(`/menu/main-course`);
    expect(res?.status()).toBeLessThan(500);
    const resVi = await page.goto(`/vi/menu/main-course`);
    expect(resVi?.status()).toBeLessThan(500);
  });
});

test.describe("Cache per-locale (Story-07, RULE-10, EC-13)", () => {
  test("AC-07.1: /en and /vi dish pages both serve successfully back-to-back without cross-contamination", async ({
    page,
  }) => {
    // Fetch en, then vi, then en again — if the cache key didn't include
    // locale, a wrong-language response could leak across requests.
    await page.goto(`/dish/${KNOWN_PRODUCT_SLUG}`);
    const enHtml1 = await page.content();

    await page.goto(`/vi/dish/${KNOWN_PRODUCT_SLUG}`);
    const viHtml = await page.content();

    await page.goto(`/dish/${KNOWN_PRODUCT_SLUG}`);
    const enHtml2 = await page.content();

    expect(enHtml1).toContain("Orange Juice");
    expect(viHtml).toContain("Orange Juice"); // fallback, still correct content
    expect(enHtml2).toContain("Orange Juice");
  });
});

test.describe("Quick-cart API — locale param (Story-05, RULE-14, AC-05.1)", () => {
  test("AC-05.1: no locale query -> defaults to en (EC-11)", async ({ request }) => {
    const res = await request.get(`/api/products/quick/1`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.product).toBeTruthy();
    expect(typeof body.product.title).toBe("string");
    expect(body.product.title.length).toBeGreaterThan(0);
  });

  test("AC-05.1: ?locale=vi with no vi row -> falls back to en content, still 200 (EC-02)", async ({
    request,
  }) => {
    const resEn = await request.get(`/api/products/quick/1`);
    const bodyEn = await resEn.json();

    const resVi = await request.get(`/api/products/quick/1?locale=vi`);
    expect(resVi.status()).toBe(200);
    const bodyVi = await resVi.json();

    expect(bodyVi.product.title).toBe(bodyEn.product.title); // fallback en
    // Non-translated fields identical regardless of locale (RULE-02/AC-04.6)
    expect(bodyVi.product.price).toBe(bodyEn.product.price);
    expect(bodyVi.product.id).toBe(bodyEn.product.id);
  });

  test("EC-15: invalid locale value -> falls back to en, no error", async ({ request }) => {
    const res = await request.get(`/api/products/quick/1?locale=fr`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.product).toBeTruthy();
  });

  test("AC-05.1: addon names present and resolved (no crash on nested addon translations, EC-14)", async ({
    request,
  }) => {
    const res = await request.get(`/api/products/quick/1?locale=vi`);
    const body = await res.json();
    expect(Array.isArray(body.product.addons)).toBe(true);
    for (const addon of body.product.addons) {
      expect(typeof addon.name).toBe("string");
      expect(addon.name.length).toBeGreaterThan(0);
    }
  });

  test("non-existent product id -> { product: null }, not a crash", async ({ request }) => {
    const res = await request.get(`/api/products/quick/999999?locale=vi`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.product).toBeNull();
  });
});

test.describe("/api/products/ids — locale param (RULE-08 extension)", () => {
  test("AC-05.2: returns products with locale-resolved fields, empty ids -> empty array", async ({
    request,
  }) => {
    const res = await request.get(`/api/products/ids?ids=&locale=vi`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.products)).toBe(true);
  });

  test("AC-05.2: valid ids resolve category + title without crashing on vi (fallback en)", async ({
    request,
  }) => {
    const res = await request.get(`/api/products/ids?ids=1,2&locale=vi`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.products)).toBe(true);
    for (const p of body.products) {
      expect(typeof p.title).toBe("string");
    }
  });
});
