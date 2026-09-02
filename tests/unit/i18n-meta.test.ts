/**
 * Unit tests for src/lib/i18n-meta.ts (sprint-4-i18n-polish): locale-aware
 * URL builders for hreflang/canonical/sitemap/og:locale.
 * Run with: npx tsx --test tests/unit/i18n-meta.test.ts
 *
 * Covers: AC-02.1, AC-02.2, AC-02.3, AC-02.4, AC-04.1, AC-04.2, AC-01.3,
 * RULE-02, RULE-03, RULE-04, RULE-06, EC-04, EC-05, EC-06, EC-12.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildLocalizedUrl,
  buildAlternates,
  buildSitemapLanguages,
  getOgLocale,
} from "@/lib/i18n-meta";
import { routing } from "@/i18n/routing";

const APP_URL = "https://www.talokitchenhg.com";

test("RULE-04: buildLocalizedUrl — defaultLocale (en) has no prefix", () => {
  assert.equal(buildLocalizedUrl("en", "/dish/orange-juice"), `${APP_URL}/dish/orange-juice`);
});

test("RULE-04: buildLocalizedUrl — non-default locale (vi) is prefixed", () => {
  assert.equal(buildLocalizedUrl("vi", "/dish/orange-juice"), `${APP_URL}/vi/dish/orange-juice`);
});

test("EC-04: home path '' -> en = APP_URL, vi = APP_URL/vi", () => {
  assert.equal(buildLocalizedUrl("en", ""), APP_URL);
  assert.equal(buildLocalizedUrl("vi", ""), `${APP_URL}/vi`);
});

test("EC-05: menu/all path prefixed correctly per locale", () => {
  assert.equal(buildLocalizedUrl("en", "/menu/all"), `${APP_URL}/menu/all`);
  assert.equal(buildLocalizedUrl("vi", "/menu/all"), `${APP_URL}/vi/menu/all`);
});

test("AC-02.1/AC-02.3/RULE-03: buildAlternates lists every routing locale + x-default", () => {
  const { languages } = buildAlternates("en", "/dish/orange-juice");
  for (const loc of routing.locales) {
    assert.ok(languages[loc], `missing languages[${loc}]`);
  }
  assert.equal(languages["x-default"], `${APP_URL}/dish/orange-juice`);
  assert.equal(languages["en"], `${APP_URL}/dish/orange-juice`);
  assert.equal(languages["vi"], `${APP_URL}/vi/dish/orange-juice`);
});

test("AC-02.2: alternates.languages is identical regardless of which locale is 'current' (bidirectional consistency)", () => {
  const fromEn = buildAlternates("en", "/dish/orange-juice").languages;
  const fromVi = buildAlternates("vi", "/dish/orange-juice").languages;
  assert.deepEqual(fromEn, fromVi);
});

test("AC-02.4/RULE-06: canonical is self-referencing per current locale", () => {
  assert.equal(
    buildAlternates("en", "/dish/orange-juice").canonical,
    `${APP_URL}/dish/orange-juice`,
  );
  assert.equal(
    buildAlternates("vi", "/dish/orange-juice").canonical,
    `${APP_URL}/vi/dish/orange-juice`,
  );
});

test("EC-12: path is a clean pathname without query string leaking into hreflang", () => {
  const { languages } = buildAlternates("en", "/menu/all");
  for (const url of Object.values(languages)) {
    assert.ok(!url.includes("?"));
  }
});

test("AC-04.1/AC-04.2/RULE-12: buildSitemapLanguages has en (no prefix) + vi (prefix), no x-default", () => {
  const languages = buildSitemapLanguages("/reservation");
  assert.equal(languages.en, `${APP_URL}/reservation`);
  assert.equal(languages.vi, `${APP_URL}/vi/reservation`);
  assert.equal(languages["x-default"], undefined);
});

test("AC-01.3/RULE-02: getOgLocale maps en->en_US, vi->vi_VN", () => {
  assert.equal(getOgLocale("en"), "en_US");
  assert.equal(getOgLocale("vi"), "vi_VN");
});

test("EC-06/RULE-02: getOgLocale on an unmapped locale returns undefined, does not crash", () => {
  // @ts-expect-error deliberately passing an unsupported locale to prove the safe-fallback path
  assert.doesNotThrow(() => getOgLocale("fr"));
  // @ts-expect-error same as above
  assert.equal(getOgLocale("fr"), undefined);
});
