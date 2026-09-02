import { test } from "@playwright/test";
import path from "node:path";

/**
 * Visual baseline capture (design-fidelity skill).
 * DAC-01..07 (LanguageSwitcher tokens/contrast/keyboard/responsive/locale-agnostic/label-stability)
 * are asserted with computed-style checks in language-switcher.spec.ts. This spec captures
 * screenshot baselines for DAC-08 (pages unchanged) / DAC-09 (404 reuse) at the smallest (360px)
 * and largest (1440px) breakpoints, light theme only (web user site is single-theme).
 *
 * Baselines are written to .sdlc/v1/sprint-1-i18n-foundation/visual-baseline/ — NOT Playwright's
 * default snapshot folder — per the design-fidelity skill convention. Re-run this spec on future
 * sprints and diff manually against these files to catch visual regressions.
 */

const OUT_DIR = path.resolve(
  __dirname,
  "..",
  "..",
  ".sdlc",
  "v1",
  "sprint-1-i18n-foundation",
  "visual-baseline",
);

const breakpoints = [
  { name: "mobile-360", width: 360, height: 800 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

const pages = [
  { name: "home", path: "/en" },
  { name: "home", path: "/vi" },
  { name: "menu", path: "/en/menu/all" },
  { name: "dish", path: "/en/dish/orange-juice" },
  { name: "reservation", path: "/en/reservation" },
  { name: "checkout", path: "/en/checkout" },
  { name: "cart", path: "/en/cart" },
  { name: "not-found", path: "/en/does-not-exist-abc" },
];

test.describe("Visual baseline capture", () => {
  for (const bp of breakpoints) {
    for (const p of pages) {
      test(`screenshot ${p.name} (${p.path}) @ ${bp.name}`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: bp.width, height: bp.height });
        await page.goto(p.path);
        await page.waitForLoadState("networkidle").catch(() => {});
        const locale = p.path.startsWith("/vi") ? "vi" : "en";
        const fileName = `${p.name}-${locale}-${bp.name}.png`;
        await page.screenshot({
          path: path.join(OUT_DIR, fileName),
          fullPage: true,
        });
      });
    }
  }
});
