/**
 * Unit tests for sprint-3-entity-i18n pure helpers:
 * - src/services/products/translations.ts (resolveProductFields/resolveCategoryFields/resolveAddon)
 * - src/lib/locale.ts (resolveLocale/getRequestLocale)
 *
 * Run with: npx tsx --conditions=react-server --test tests/unit/entity-translations.test.ts
 * (the react-server export condition picks the no-op `server-only/empty.js`
 * so this pure-logic module can load standalone in plain Node, exactly like
 * it would inside a React Server Component bundle — no DB I/O is exercised.)
 *
 * Covers: RULE-04, RULE-07, RULE-09 (per-field COALESCE), RULE-14, RULE-20,
 * EC-01..EC-06, EC-11, EC-15, NFR-01 (pure, no I/O), NFR-08 (no crash).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  resolveProductFields,
  resolveCategoryFields,
  resolveAddon,
} from "@/services/products/translations";
import { resolveLocale, getRequestLocale } from "@/lib/locale";

// ---------------------------------------------------------------------------
// resolveProductFields (RULE-07, EC-01..05)
// ---------------------------------------------------------------------------

const baseProduct = {
  title: "Base Title EN",
  description: "Base description EN",
  subDescription: "Base sub EN",
  allergenInfo: "Base allergen EN",
};

test("resolveProductFields: vi row present & non-empty -> vi values (AC-04.1)", () => {
  const resolved = resolveProductFields(
    baseProduct,
    [
      {
        locale: "vi",
        title: "Tieu de VI",
        description: "Mo ta VI",
        subDescription: "Mo ta ngan VI",
        allergenInfo: "Di ung VI",
      },
    ],
    "vi",
  );
  assert.deepEqual(resolved, {
    title: "Tieu de VI",
    description: "Mo ta VI",
    subDescription: "Mo ta ngan VI",
    allergenInfo: "Di ung VI",
  });
});

test("resolveProductFields: missing vi row entirely -> fallback base (EC-02/EC-05)", () => {
  const resolved = resolveProductFields(baseProduct, [], "vi");
  assert.deepEqual(resolved, baseProduct);
});

test("resolveProductFields: vi row exists but one field empty -> only that field falls back (EC-03, per-field COALESCE)", () => {
  const resolved = resolveProductFields(
    baseProduct,
    [
      {
        locale: "vi",
        title: "Tieu de VI",
        description: "",
        subDescription: null,
        allergenInfo: "Di ung VI",
      },
    ],
    "vi",
  );
  assert.equal(resolved.title, "Tieu de VI");
  assert.equal(resolved.description, baseProduct.description); // fell back
  assert.equal(resolved.subDescription, baseProduct.subDescription); // fell back
  assert.equal(resolved.allergenInfo, "Di ung VI");
});

test("resolveProductFields: vi row + base both empty for a field -> null (nullable) / '' (title) (EC-04, no crash)", () => {
  const resolved = resolveProductFields(
    { title: "", description: null, subDescription: null, allergenInfo: null },
    [{ locale: "vi", title: "", description: null, subDescription: null, allergenInfo: null }],
    "vi",
  );
  assert.equal(resolved.title, "");
  assert.equal(resolved.description, null);
  assert.equal(resolved.subDescription, null);
  assert.equal(resolved.allergenInfo, null);
});

test("resolveProductFields: at defaultLocale (en) -> en row/base value (AC-04.3)", () => {
  const resolved = resolveProductFields(
    baseProduct,
    [{ locale: "en", title: "En row title", description: null, subDescription: null, allergenInfo: null }],
    "en",
  );
  assert.equal(resolved.title, "En row title");
  assert.equal(resolved.description, baseProduct.description); // en row field empty -> base
});

test("resolveProductFields: locale not in routing (e.g. 'fr') has no matching row -> fallback base, no throw (EC-15)", () => {
  const resolved = resolveProductFields(
    baseProduct,
    [{ locale: "vi", title: "VI", description: null, subDescription: null, allergenInfo: null }],
    // @ts-expect-error deliberately passing an unsupported locale value
    "fr",
  );
  assert.deepEqual(resolved, baseProduct);
});

test("resolveProductFields: undefined translations array -> fallback base, no crash (EC-05, product just created)", () => {
  const resolved = resolveProductFields(baseProduct, undefined, "vi");
  assert.deepEqual(resolved, baseProduct);
});

// ---------------------------------------------------------------------------
// resolveCategoryFields (RULE-07, EC-06)
// ---------------------------------------------------------------------------

test("resolveCategoryFields: vi present -> vi values", () => {
  const resolved = resolveCategoryFields(
    { name: "Main Course", description: "Base desc" },
    [{ locale: "vi", name: "Mon chinh", description: "Mo ta VI" }],
    "vi",
  );
  assert.deepEqual(resolved, { name: "Mon chinh", description: "Mo ta VI" });
});

test("resolveCategoryFields: description null (nullable) on both base and vi row -> null, no crash (EC-06)", () => {
  const resolved = resolveCategoryFields(
    { name: "Main Course", description: null },
    [{ locale: "vi", name: "Mon chinh", description: null }],
    "vi",
  );
  assert.equal(resolved.description, null);
  assert.equal(resolved.name, "Mon chinh");
});

test("resolveCategoryFields: missing vi row -> fallback base (EC-02)", () => {
  const resolved = resolveCategoryFields(
    { name: "Main Course", description: "Base desc" },
    [],
    "vi",
  );
  assert.deepEqual(resolved, { name: "Main Course", description: "Base desc" });
});

// ---------------------------------------------------------------------------
// resolveAddon (RULE-07/RULE-09, EC-14 shape)
// ---------------------------------------------------------------------------

test("resolveAddon: vi present -> vi name", () => {
  const resolved = resolveAddon({ name: "Egg" }, [{ locale: "vi", name: "Trung" }], "vi");
  assert.deepEqual(resolved, { name: "Trung" });
});

test("resolveAddon: vi row name empty -> fallback base name (EC-03)", () => {
  const resolved = resolveAddon({ name: "Egg" }, [{ locale: "vi", name: "" }], "vi");
  assert.deepEqual(resolved, { name: "Egg" });
});

test("resolveAddon: no translations at all -> base name, no crash (EC-05)", () => {
  const resolved = resolveAddon({ name: "Egg" }, [], "vi");
  assert.deepEqual(resolved, { name: "Egg" });
});

// ---------------------------------------------------------------------------
// resolveLocale (RULE-04, EC-15)
// ---------------------------------------------------------------------------

test("resolveLocale: valid locale passthrough", () => {
  assert.equal(resolveLocale("vi"), "vi");
  assert.equal(resolveLocale("en"), "en");
});

test("resolveLocale: invalid/garbage/missing -> defaultLocale (en) (EC-15)", () => {
  assert.equal(resolveLocale("fr"), "en");
  assert.equal(resolveLocale(""), "en");
  assert.equal(resolveLocale(null), "en");
  assert.equal(resolveLocale(undefined), "en");
});

// ---------------------------------------------------------------------------
// getRequestLocale (RULE-14, EC-11, EC-15) — priority: query > cookie > Accept-Language > default
// ---------------------------------------------------------------------------

function makeRequest(opts: {
  url?: string;
  cookie?: string;
  acceptLanguage?: string;
}) {
  const headers = new Headers();
  if (opts.cookie) headers.set("cookie", opts.cookie);
  if (opts.acceptLanguage) headers.set("accept-language", opts.acceptLanguage);
  return new Request(opts.url ?? "http://localhost/api/products/quick/1", {
    headers,
  });
}

test("getRequestLocale: query param wins over everything (RULE-14)", () => {
  const req = makeRequest({
    url: "http://localhost/api/products/quick/1?locale=vi",
    cookie: "NEXT_LOCALE=en",
    acceptLanguage: "en-US",
  });
  assert.equal(getRequestLocale(req), "vi");
});

test("getRequestLocale: invalid query falls through to cookie", () => {
  const req = makeRequest({
    url: "http://localhost/api/products/quick/1?locale=fr",
    cookie: "NEXT_LOCALE=vi",
  });
  assert.equal(getRequestLocale(req), "vi");
});

test("getRequestLocale: no query, cookie present -> cookie", () => {
  const req = makeRequest({ cookie: "NEXT_LOCALE=vi" });
  assert.equal(getRequestLocale(req), "vi");
});

test("getRequestLocale: no query/cookie, Accept-Language -> primary tag", () => {
  const req = makeRequest({ acceptLanguage: "vi-VN,vi;q=0.9,en;q=0.8" });
  assert.equal(getRequestLocale(req), "vi");
});

test("getRequestLocale: nothing at all -> default en, no throw (EC-11)", () => {
  const req = makeRequest({});
  assert.equal(getRequestLocale(req), "en");
});

test("getRequestLocale: unsupported Accept-Language primary tag -> default en (EC-15)", () => {
  const req = makeRequest({ acceptLanguage: "fr-FR,fr;q=0.9" });
  assert.equal(getRequestLocale(req), "en");
});
