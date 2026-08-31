import { APP_URL } from "@/constants/app";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/types/configs";

/**
 * Pure metadata helpers for building locale-aware URLs (canonical/alternates/
 * sitemap/OG locale). NO `server-only` import here — must be importable from
 * unit tests / standalone scripts alike, mirroring `src/lib/locale.ts`.
 *
 * Locale-agnostic: always iterate `routing.locales` / use
 * `routing.defaultLocale` instead of hardcoding "en"/"vi" pairs.
 */

/**
 * Build an absolute, locale-prefixed URL for a given pathname using the
 * `as-needed` locale prefix scheme (matches `routing.localePrefix`):
 * - `locale === routing.defaultLocale` → no prefix.
 * - otherwise → `/${locale}` prefix.
 *
 * `path` must be a pathname WITHOUT any locale prefix, starting with `/`
 * (or `""` for the home page).
 */
export function buildLocalizedUrl(locale: Locale, path: string): string {
  if (locale === routing.defaultLocale) {
    return `${APP_URL}${path}`;
  }
  return `${APP_URL}/${locale}${path}`;
}

/**
 * Build `alternates` metadata (canonical + hreflang languages) for a page.
 * - `languages[loc]` for EVERY `loc` in `routing.locales` (looped, never
 *   hardcoded).
 * - `languages["x-default"]` points at the default-locale URL.
 * - `canonical` is self-referencing: the URL for `currentLocale` itself.
 */
export function buildAlternates(
  currentLocale: Locale,
  path: string,
): { canonical: string; languages: Record<string, string> } {
  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = buildLocalizedUrl(loc, path);
  }
  languages["x-default"] = buildLocalizedUrl(routing.defaultLocale, path);

  return {
    canonical: buildLocalizedUrl(currentLocale, path),
    languages,
  };
}

/**
 * Build the `languages` map for a sitemap entry: `{ [loc]: url }` for every
 * `loc` in `routing.locales`. Unlike `buildAlternates`, this does NOT include
 * `x-default` (not part of the sitemap `xhtml:link` format).
 */
export function buildSitemapLanguages(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = buildLocalizedUrl(loc, path);
  }
  return languages;
}

/** Map a `Locale` to its Open Graph `og:locale` value. Unknown → `undefined` (omit, don't crash). */
const OG_LOCALE_MAP: Partial<Record<Locale, string>> = {
  en: "en_US",
  vi: "vi_VN",
};

export function getOgLocale(locale: Locale): string | undefined {
  return OG_LOCALE_MAP[locale];
}
