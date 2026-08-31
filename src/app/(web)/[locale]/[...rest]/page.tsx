import { notFound } from "next/navigation";

/**
 * QA fix (sprint-4-i18n-polish gate): catch-all for any path under the
 * `[locale]` segment that doesn't match a defined page (typo'd URL, dead
 * link, etc).
 *
 * WITHOUT this file, Next.js can't match e.g. `/vi/some-typo` to ANY route
 * (no page in this tree handles an arbitrary trailing segment), so it never
 * enters the `[locale]` layout tree at all and falls back to the app's
 * ROOT `not-found.tsx` — which is hardcoded English and has no `<html lang>`
 * (violates AC-09.4 / Story-08 for the single most common 404 a real user
 * hits: a mistyped URL).
 *
 * WITH this file, the route DOES match inside `[locale]`, so `notFound()`
 * here is discarded in favor of the already locale-aware
 * `(web)/[locale]/not-found.tsx` boundary (same mechanism already relied on
 * by `dish/[slug]` for "product not found" — see EC-01 fix).
 */
export default function CatchAllNotFound() {
  notFound();
}
