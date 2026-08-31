import { test, expect } from "@playwright/test";

/**
 * sprint-4-i18n-polish — generateMetadata per locale, hreflang alternates,
 * sitemap alternates, currency/date display, fallback safety, no leftover
 * English hardcode on user-facing metadata.
 *
 * Covers: Story-01..09, AC-01.*, AC-02.*, AC-03.*, AC-04.*, AC-05.4 (wiring),
 * AC-07.*, AC-08.2, AC-09.4, EC-01..EC-05, EC-10, EC-11.
 */

const KNOWN_PRODUCT_SLUG = "orange-juice";

function getMetaContent(html: string, attr: "name" | "property", key: string) {
  const re = new RegExp(
    `<meta ${attr}="${key}" content="([^"]*)"`,
  );
  const m = re.exec(html);
  return m ? m[1] : null;
}

function getTitle(html: string) {
  const m = /<title>([^<]*)<\/title>/.exec(html);
  return m ? m[1] : null;
}

function getAlternateLinks(html: string) {
  const links: Record<string, string> = {};
  const re = /<link rel="alternate" hrefLang="([^"]+)" href="([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) {
    links[m[1]] = m[2];
  }
  return links;
}

function getCanonical(html: string) {
  const m = /<link rel="canonical" href="([^"]+)"/.exec(html);
  return m ? m[1] : null;
}

test.describe("Story-01/02: dish/[slug] metadata + hreflang per locale", () => {
  test("AC-01.2/AC-01.3/AC-02.1/AC-02.4: en dish page has en title, og:locale en_US, full hreflang set, self canonical", async ({
    request,
  }) => {
    const res = await request.get(`/dish/${KNOWN_PRODUCT_SLUG}`);
    expect(res.status()).toBe(200);
    const html = await res.text();

    expect(getTitle(html)).toContain("TALO Kitchen");
    expect(getMetaContent(html, "property", "og:locale")).toBe("en_US");

    const links = getAlternateLinks(html);
    expect(links.en).toBe(
      `https://www.talokitchenhg.com/dish/${KNOWN_PRODUCT_SLUG}`,
    );
    expect(links.vi).toBe(
      `https://www.talokitchenhg.com/vi/dish/${KNOWN_PRODUCT_SLUG}`,
    );
    expect(links["x-default"]).toBe(links.en);
    expect(getCanonical(html)).toBe(links.en);
  });

  test("AC-01.1/AC-01.3/AC-02.2/AC-02.4: vi dish page has vi content, og:locale vi_VN, SAME hreflang set as en, self canonical to /vi", async ({
    request,
  }) => {
    const enRes = await request.get(`/dish/${KNOWN_PRODUCT_SLUG}`);
    const enLinks = getAlternateLinks(await enRes.text());

    const res = await request.get(`/vi/dish/${KNOWN_PRODUCT_SLUG}`);
    expect(res.status()).toBe(200);
    const html = await res.text();

    expect(getMetaContent(html, "property", "og:locale")).toBe("vi_VN");

    const links = getAlternateLinks(html);
    // AC-02.2: bidirectional consistency — same URL set regardless of which locale page you're on.
    expect(links).toEqual(enLinks);
    expect(getCanonical(html)).toBe(links.vi);
  });

  test("AC-02.3: en URL has no /en prefix, vi URL has /vi prefix", async ({ request }) => {
    const res = await request.get(`/dish/${KNOWN_PRODUCT_SLUG}`);
    const links = getAlternateLinks(await res.text());
    expect(links.en).not.toMatch(/\/en\//);
    expect(links.vi).toMatch(/^https:\/\/www\.talokitchenhg\.com\/vi\//);
  });

  test("AC-01.4/EC-01/RULE-05: dish 404 (product not found) has non-empty, locale-appropriate title (no raw i18n key, no crash)", async ({
    request,
  }) => {
    // NOTE: when the page component calls next/navigation `notFound()`, Next
    // discards that route's own `generateMetadata` result and renders the
    // nearest `not-found.tsx` boundary instead — so the effective title comes
    // from `(web)/[locale]/not-found.tsx`'s own `generateMetadata` (fixed in
    // this test round to be locale-aware), not from the dish page's
    // "Product Not Found" string (which is unreachable dead code once
    // `notFound()` is called, by Next.js App Router design).
    const enRes = await request.get(`/dish/does-not-exist-xyz`);
    const enHtml = await enRes.text();
    const enTitle = getTitle(enHtml);
    expect(enTitle).toBeTruthy();
    expect(enTitle).not.toMatch(/^metadata\./); // no raw i18n key leaking
    expect(enTitle).not.toMatch(/^notFound\./);

    const viRes = await request.get(`/vi/dish/does-not-exist-xyz`);
    const viHtml = await viRes.text();
    const viTitle = getTitle(viHtml);
    expect(viTitle).toBeTruthy();
    expect(viTitle).not.toEqual(enTitle); // EC-01 intent: title must differ per locale, not empty
  });
});

test.describe("Story-01/02: home page metadata + hreflang", () => {
  test("EC-04: home hreflang — en=APP_URL (no path), vi=APP_URL/vi, x-default=en", async ({
    request,
  }) => {
    const res = await request.get(`/`);
    expect(res.status()).toBe(200);
    const html = await res.text();
    const links = getAlternateLinks(html);
    expect(links.en).toBe("https://www.talokitchenhg.com");
    expect(links.vi).toBe("https://www.talokitchenhg.com/vi");
    expect(links["x-default"]).toBe(links.en);
  });

  test("AC-01.3/AC-01.4: og:locale correct + title non-empty on both locales", async ({
    request,
  }) => {
    const enRes = await request.get(`/`);
    const enHtml = await enRes.text();
    expect(getMetaContent(enHtml, "property", "og:locale")).toBe("en_US");
    expect(getTitle(enHtml)).toBeTruthy();

    const viRes = await request.get(`/vi`);
    const viHtml = await viRes.text();
    expect(getMetaContent(viHtml, "property", "og:locale")).toBe("vi_VN");
    expect(getTitle(viHtml)).toBeTruthy();
  });
});

test.describe("Story-02: menu/[category] hreflang + EC-05/EC-11", () => {
  test("EC-05: menu/all hreflang uses /menu/all path, vi prefixed correctly", async ({
    request,
  }) => {
    const res = await request.get(`/menu/all`);
    expect(res.status()).toBe(200);
    const links = getAlternateLinks(await res.text());
    expect(links.en).toBe("https://www.talokitchenhg.com/menu/all");
    expect(links.vi).toBe("https://www.talokitchenhg.com/vi/menu/all");
  });

  test("AC-08.2/EC-10: menu 'All' category label is localized in vi title, not the raw English 'All'", async ({
    request,
  }) => {
    const enRes = await request.get(`/menu/all`);
    const enTitle = getTitle(await enRes.text());
    expect(enTitle).toContain("All Menu");

    const viRes = await request.get(`/vi/menu/all`);
    const viTitle = getTitle(await viRes.text());
    expect(viTitle).not.toContain("All Menu");
    expect(viTitle).toContain("Toàn bộ thực đơn");
  });

  test("EC-11: invalid/garbage category slug does not crash metadata generation (resolveLocale safety)", async ({
    request,
  }) => {
    const res = await request.get(`/menu/does-not-exist-category`);
    expect(res.status()).toBeLessThan(500);
  });
});

test.describe("Story-03: cart & checkout metadata now locale-aware (was static English)", () => {
  test("AC-03.1/AC-03.2: /cart title/description differ per locale + has hreflang + og:locale", async ({
    request,
  }) => {
    const enRes = await request.get(`/cart`);
    expect(enRes.status()).toBe(200);
    const enHtml = await enRes.text();
    const enTitle = getTitle(enHtml);
    expect(enTitle).toContain("Shopping Cart");
    expect(getMetaContent(enHtml, "property", "og:locale")).toBe("en_US");
    expect(getAlternateLinks(enHtml).vi).toBe(
      "https://www.talokitchenhg.com/vi/cart",
    );

    const viRes = await request.get(`/vi/cart`);
    expect(viRes.status()).toBe(200);
    const viHtml = await viRes.text();
    const viTitle = getTitle(viHtml);
    expect(viTitle).toContain("Giỏ hàng");
    expect(viTitle).not.toEqual(enTitle);
    expect(getMetaContent(viHtml, "property", "og:locale")).toBe("vi_VN");
  });

  test("AC-03.1/AC-03.2: /checkout title/description differ per locale + has hreflang + og:locale", async ({
    request,
  }) => {
    const enRes = await request.get(`/checkout`);
    expect(enRes.status()).toBe(200);
    const enHtml = await enRes.text();
    const enTitle = getTitle(enHtml);
    expect(enTitle).toContain("Checkout");
    expect(getMetaContent(enHtml, "property", "og:locale")).toBe("en_US");

    const viRes = await request.get(`/vi/checkout`);
    expect(viRes.status()).toBe(200);
    const viHtml = await viRes.text();
    const viTitle = getTitle(viHtml);
    expect(viTitle).toContain("Thanh toán");
    expect(viTitle).not.toEqual(enTitle);
    expect(getMetaContent(viHtml, "property", "og:locale")).toBe("vi_VN");
  });
});

test.describe("Story-01/02: reservation page metadata + hreflang", () => {
  test("reservation page: hreflang set + og:locale correct on both locales", async ({
    request,
  }) => {
    const enRes = await request.get(`/reservation`);
    expect(enRes.status()).toBe(200);
    const enHtml = await enRes.text();
    expect(getMetaContent(enHtml, "property", "og:locale")).toBe("en_US");
    const links = getAlternateLinks(enHtml);
    expect(links.vi).toBe("https://www.talokitchenhg.com/vi/reservation");

    const viRes = await request.get(`/vi/reservation`);
    expect(viRes.status()).toBe(200);
    const viHtml = await viRes.text();
    expect(getMetaContent(viHtml, "property", "og:locale")).toBe("vi_VN");
  });
});

test.describe("Story-04: sitemap.xml hreflang alternates", () => {
  test("AC-04.1/AC-04.2/AC-04.3: sitemap has xhtml:link alternates (en no-prefix, vi /vi-prefix) for home/menu/reservation/dish, URL count unchanged shape", async ({
    request,
  }) => {
    const res = await request.get(`/sitemap.xml`);
    expect(res.status()).toBe(200);
    const xml = await res.text();

    expect(xml).toContain(
      '<xhtml:link rel="alternate" hreflang="en" href="https://www.talokitchenhg.com" />',
    );
    expect(xml).toContain(
      '<xhtml:link rel="alternate" hreflang="vi" href="https://www.talokitchenhg.com/vi" />',
    );
    expect(xml).toContain(
      '<xhtml:link rel="alternate" hreflang="en" href="https://www.talokitchenhg.com/menu/all" />',
    );
    expect(xml).toContain(
      '<xhtml:link rel="alternate" hreflang="vi" href="https://www.talokitchenhg.com/vi/menu/all" />',
    );
    expect(xml).toContain(
      '<xhtml:link rel="alternate" hreflang="en" href="https://www.talokitchenhg.com/reservation" />',
    );
    expect(xml).toContain(
      '<xhtml:link rel="alternate" hreflang="vi" href="https://www.talokitchenhg.com/vi/reservation" />',
    );
    expect(xml).toContain(`https://www.talokitchenhg.com/dish/${KNOWN_PRODUCT_SLUG}`);

    // Every <loc> entry should have at least one paired alternate hreflang for every routing locale.
    const locCount = (xml.match(/<loc>/g) || []).length;
    const enAltCount = (xml.match(/hreflang="en"/g) || []).length;
    const viAltCount = (xml.match(/hreflang="vi"/g) || []).length;
    expect(enAltCount).toBe(locCount);
    expect(viAltCount).toBe(locCount);
  });
});

test.describe("Story-07/09: fallback safety + regression (html lang, no raw keys)", () => {
  test("AC-09.4: <html lang> matches locale on every checked page", async ({ page }) => {
    const enHtml = await (await page.goto("/")) && (await page.content());
    expect(enHtml).toMatch(/<html[^>]*lang="en"/);

    const viHtml = await (await page.goto("/vi")) && (await page.content());
    expect(viHtml).toMatch(/<html[^>]*lang="vi"/);
  });

  test("AC-07.4/AC-09.4: switching locale on dish/cart/checkout/reservation causes no runtime error and each renders body content", async ({
    page,
  }) => {
    const paths = [
      `/dish/${KNOWN_PRODUCT_SLUG}`,
      `/vi/dish/${KNOWN_PRODUCT_SLUG}`,
      `/cart`,
      `/vi/cart`,
      `/checkout`,
      `/vi/checkout`,
      `/reservation`,
      `/vi/reservation`,
      `/menu/all`,
      `/vi/menu/all`,
    ];
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(String(err)));

    for (const p of paths) {
      const res = await page.goto(p);
      expect(res?.status(), `${p} should not 500`).toBeLessThan(500);
      await expect(page.locator("body")).not.toBeEmpty();
    }
    expect(errors, errors.join("\n")).toEqual([]);
  });
});
