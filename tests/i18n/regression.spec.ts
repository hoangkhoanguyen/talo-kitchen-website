import { test, expect } from "@playwright/test";

/**
 * Story-06 (admin unaffected) + RI-01, RI-02, RI-05, RI-06 + EC-04, EC-05, AC-06.1..3
 */

test.describe("Regression: admin auth / web API / static files must not break", () => {
  test("AC-06.1/AC-06.2/EC-05: admin dashboard (not logged in) redirects to /admin/login, no locale prefix", async ({
    request,
  }) => {
    const res = await request.get("/admin/dashboard", { maxRedirects: 0 });
    expect(res.status()).toBe(307);
    const location = res.headers()["location"];
    expect(location).toMatch(/^\/admin\/login\?callback_url=/);
    expect(location).not.toMatch(/\/(en|vi)\/admin/);
  });

  test("AC-06.1/EC-05: admin orders (not logged in) redirects to /admin/login with correct callback, no loop", async ({
    request,
  }) => {
    const res = await request.get("/admin/orders", { maxRedirects: 0 });
    expect(res.status()).toBe(307);
    expect(res.headers()["location"]).toBe(
      "/admin/login?callback_url=%2Fadmin%2Forders",
    );
  });

  test("AC-06.1: /admin/register is reachable without locale prefix (200)", async ({
    request,
  }) => {
    const res = await request.get("/admin/register", { maxRedirects: 0 });
    expect(res.status()).toBe(200);
  });

  test("RI-02/EC-04: /api/products/ids is not prefixed by locale and returns 200 JSON", async ({
    request,
  }) => {
    const res = await request.get("/api/products/ids");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("products");
  });

  test("RI-02/EC-04: /api/products/quick/[id] is not prefixed by locale and returns 200 JSON", async ({
    request,
  }) => {
    const res = await request.get("/api/products/quick/18");
    expect(res.status()).toBe(200);
  });

  test("RI-05: /robots.txt is served without being redirected/404'd by i18n middleware", async ({
    request,
  }) => {
    const res = await request.get("/robots.txt", { maxRedirects: 0 });
    expect(res.status()).toBe(200);
  });

  test("RI-05: /sitemap.xml is served without being redirected/404'd by i18n middleware", async ({
    request,
  }) => {
    const res = await request.get("/sitemap.xml", { maxRedirects: 0 });
    expect(res.status()).toBe(200);
  });

  test("site.webmanifest is served without being redirected/404'd by i18n middleware", async ({
    request,
  }) => {
    const res = await request.get("/site.webmanifest", { maxRedirects: 0 });
    expect(res.status()).toBe(200);
  });

  test("RI-06: unknown path outside any locale still resolves to a 404 (no redirect loop)", async ({
    request,
  }) => {
    const res = await request.get("/this-page-does-not-exist-xyz", {
      maxRedirects: 5,
    });
    expect(res.status()).toBe(404);
  });
});
