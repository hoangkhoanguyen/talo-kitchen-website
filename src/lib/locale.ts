import { routing } from "@/i18n/routing";
import type { Locale } from "@/types/configs";

/**
 * Pure locale helpers. NO `server-only` import here — must be importable
 * from standalone tsx scripts (seed/rollback) AND from Next.js API routes /
 * server actions alike (design §2 tech decision 3).
 *
 * Locale-agnostic: always iterate `routing.locales` / use `routing.defaultLocale`
 * instead of hardcoding "en"/"vi" (RULE-20).
 */

/**
 * Resolve an arbitrary string into a supported `Locale`.
 * - `input` is a member of `routing.locales` → use it.
 * - otherwise (undefined / garbage / unsupported) → `routing.defaultLocale` (RULE-04, EC-15).
 */
export function resolveLocale(input?: string | null): Locale {
  if (input && (routing.locales as readonly string[]).includes(input)) {
    return input as Locale;
  }
  return routing.defaultLocale;
}

const COOKIE_NAME = "NEXT_LOCALE";

/**
 * Parse the primary language tag out of an `Accept-Language` header value,
 * e.g. `"vi-VN,vi;q=0.9,en;q=0.8"` → `"vi"`. Returns `undefined` when the
 * header is missing/empty/unparsable.
 */
function parsePrimaryLanguageTag(
  acceptLanguage: string | null,
): string | undefined {
  if (!acceptLanguage) return undefined;
  const first = acceptLanguage.split(",")[0]?.trim();
  if (!first) return undefined;
  // strip q-value if present on the first entry, then take the primary
  // subtag before any region/script subtag (e.g. "vi-VN" -> "vi").
  const tag = first.split(";")[0]?.trim();
  if (!tag) return undefined;
  const primary = tag.split("-")[0]?.trim().toLowerCase();
  return primary || undefined;
}

/**
 * Resolve the request locale for an API route (RULE-14). Priority order:
 * query `?locale=` → cookie `NEXT_LOCALE` → `Accept-Language` header → default.
 * Any garbage/unsupported value at any step falls through to the next
 * source, ultimately falling back to `routing.defaultLocale` (EC-11, EC-15).
 */
export function getRequestLocale(request: Request): Locale {
  const url = new URL(request.url);
  const queryLocale = url.searchParams.get("locale");
  if (queryLocale && (routing.locales as readonly string[]).includes(queryLocale)) {
    return queryLocale as Locale;
  }

  const cookieHeader = request.headers.get("cookie");
  const cookieLocale = parseCookieValue(cookieHeader, COOKIE_NAME);
  if (cookieLocale && (routing.locales as readonly string[]).includes(cookieLocale)) {
    return cookieLocale as Locale;
  }

  const acceptLanguage = request.headers.get("accept-language");
  const primaryTag = parsePrimaryLanguageTag(acceptLanguage);
  if (primaryTag && (routing.locales as readonly string[]).includes(primaryTag)) {
    return primaryTag as Locale;
  }

  return resolveLocale(undefined);
}

/** Extract a single cookie value by name from a raw `Cookie` header string. */
function parseCookieValue(
  cookieHeader: string | null,
  name: string,
): string | undefined {
  if (!cookieHeader) return undefined;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (key === name) {
      const value = part.slice(idx + 1).trim();
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }
  return undefined;
}
