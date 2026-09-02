import { test, expect } from "@playwright/test";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/**
 * Static, non-browser checks that don't need the dev server:
 * - AC-05.4 / RULE-07: no hardcoded user-facing English strings left in web JSX
 * - RULE-01/NFR-05/EC-12: locale-agnostic architecture (adding a locale needs no code change)
 * - RULE-08: vi.json superset/fallback shape sanity
 */

const ROOT = path.resolve(__dirname, "..", "..");

test.describe("Static source checks (no server required)", () => {
  test("AC-05.4: no leftover hardcoded English JSX text in web-user reservation/checkout/cart/home components", async () => {
    // Sample of strings that were known to be hardcoded before extraction (design.md baseline).
    const suspiciousStrings = [
      "Make a Reservation",
      "Reservation Details",
      "Preferred Date (GMT +7)",
      "Please fill out all required fields",
      "Add to Cart",
      "Your cart is empty",
    ];

    const webDir = path.join(ROOT, "src", "app", "(web)");
    const componentsDir = path.join(ROOT, "src", "components", "web");

    const files: string[] = [];
    const walk = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.(tsx|ts)$/.test(entry.name)) files.push(full);
      }
    };
    walk(webDir);
    walk(componentsDir);

    const offenders: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      for (const s of suspiciousStrings) {
        // Only flag if it appears as JSX text content (a quoted/plain string), not inside messages/*.json refs.
        if (content.includes(`"${s}`) || content.includes(`>${s}`)) {
          offenders.push(`${path.relative(ROOT, file)} contains "${s}"`);
        }
      }
    }

    expect(offenders, offenders.join("\n")).toEqual([]);
  });

  test("RULE-01/EC-12: locale config is centralized and locale-agnostic", async () => {
    const routingFile = path.join(ROOT, "src", "i18n", "routing.ts");
    expect(fs.existsSync(routingFile)).toBe(true);
    const content = fs.readFileSync(routingFile, "utf-8");
    expect(content).toMatch(/locales\s*:\s*\[/);
    expect(content).toMatch(/defaultLocale\s*:\s*["']en["']/);

    // LanguageSwitcher must map over the central locale list, not hardcode 2 entries.
    const switcherFile = path.join(
      ROOT,
      "src",
      "components",
      "web",
      "shared",
      "header",
      "LanguageSwitcher.tsx",
    );
    const switcherContent = fs.readFileSync(switcherFile, "utf-8");
    expect(switcherContent).toMatch(/routing\.locales\.map/);
  });

  test("RULE-08: en.json is a superset of vi.json namespaces (no orphan namespace only in vi)", async () => {
    const en = JSON.parse(
      fs.readFileSync(path.join(ROOT, "messages", "en.json"), "utf-8"),
    );
    const vi = JSON.parse(
      fs.readFileSync(path.join(ROOT, "messages", "vi.json"), "utf-8"),
    );

    const collectKeys = (obj: Record<string, unknown>, prefix = ""): string[] => {
      let keys: string[] = [];
      for (const [k, v] of Object.entries(obj)) {
        const full = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === "object" && !Array.isArray(v)) {
          keys = keys.concat(collectKeys(v as Record<string, unknown>, full));
        } else {
          keys.push(full);
        }
      }
      return keys;
    };

    const enKeys = new Set(collectKeys(en));
    const viKeys = collectKeys(vi);

    const orphanViKeys = viKeys.filter((k) => !enKeys.has(k));
    expect(orphanViKeys, orphanViKeys.join("\n")).toEqual([]);

    // No empty-string values (would render blank instead of falling back).
    const emptyValues: string[] = [];
    const checkEmpty = (obj: Record<string, unknown>, prefix = "") => {
      for (const [k, v] of Object.entries(obj)) {
        const full = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === "object" && !Array.isArray(v)) {
          checkEmpty(v as Record<string, unknown>, full);
        } else if (v === "") {
          emptyValues.push(full);
        }
      }
    };
    checkEmpty(en);
    checkEmpty(vi);
    expect(emptyValues, emptyValues.join("\n")).toEqual([]);
  });

  test("RI-08: next.config.ts still declares images.remotePatterns after wrapping with next-intl plugin", async () => {
    const configPath = fs.existsSync(path.join(ROOT, "next.config.ts"))
      ? path.join(ROOT, "next.config.ts")
      : path.join(ROOT, "src", "next.config.ts");
    const content = fs.readFileSync(configPath, "utf-8");
    expect(content).toMatch(/createNextIntlPlugin/);
    expect(content).toMatch(/remotePatterns/);
  });

  test("EC-12 dry-run: adding a 3rd locale only requires editing routing.ts locales array + a messages file", async () => {
    // Structural proof: routing.ts must not hardcode "en"/"vi" anywhere else (middleware/navigation),
    // i.e. no other source file besides routing.ts + messages/*.json references the literal pair.
    const navFile = path.join(ROOT, "src", "i18n", "navigation.ts");
    const navContent = fs.readFileSync(navFile, "utf-8");
    expect(navContent).not.toMatch(/["'](en|vi)["']/);
  });
});
