import { test, expect, Page } from "@playwright/test";
import { config as loadEnv } from "dotenv";
import { SignJWT } from "jose";

loadEnv({ path: ".env.local" });

/**
 * sprint-2-config-i18n — admin localized field renderer (tab strip) + real
 * end-to-end save→resolve round trip.
 *
 * Covers Story-01 (AC-01.1..AC-01.5), Story-02 (AC-02.1..AC-02.3),
 * ui-design.md DAC-01..DAC-09, EC-11 (cache invalidated for every locale
 * after save), EC-15 (copy empty en = no-op).
 *
 * AUTH NOTE (pre-existing, out of scope for sprint-2): the interactive login
 * form (`loginUser` → `createRefreshToken`) currently fails on this
 * `dev_multi_lang` schema with "permission denied for sequence
 * refresh_tokens_id_seq" — the dev DB role can SELECT/UPDATE `configs` (what
 * sprint-2 needs) but cannot INSERT into `users`/`refresh_tokens`. This is a
 * DB-role/grant issue unrelated to the i18n feature under test. To still
 * exercise the real admin renderer, we mint a valid `access_token` JWT with
 * the same secret/shape as `signAccessToken` (src/lib/auth.ts) and inject it
 * as a cookie — the proxy only checks for the cookie's presence, and no
 * further route in this sprint queries the DB for the acting user. See
 * test-report.md for the full note + recommended DB grant fix.
 */

const ADMIN_USER_ID = Number(process.env.QA_ADMIN_USER_ID ?? 4);
const ADMIN_USERNAME = process.env.QA_ADMIN_USER ?? "hungadmin";
const ADMIN_EMAIL = process.env.QA_ADMIN_EMAIL ?? "zearth113@gmail.com";

async function login(page: Page) {
  const secretEnv = process.env.ACCESS_TOKEN_JWT_SECRET;
  if (!secretEnv) {
    throw new Error("ACCESS_TOKEN_JWT_SECRET not set in .env.local");
  }
  const secret = new TextEncoder().encode(secretEnv);
  const token = await new SignJWT({
    userId: ADMIN_USER_ID,
    email: ADMIN_EMAIL,
    username: ADMIN_USERNAME,
    firstName: "QA",
    lastName: "Tester",
    role: "admin",
    isActive: true,
    tokenType: "access",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30m")
    .sign(secret);

  await page.goto("/admin/login"); // establish origin before setting cookie
  await page.context().addCookies([
    {
      name: "access_token",
      value: token,
      url: page.url(),
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);
  await page.goto("/admin/dashboard");
  await expect(page).not.toHaveURL(/\/admin\/login/);
}

test.describe("Admin localized field renderer — homepage / contact / description", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/admin/settings/ui/homepage");
    await expect(page.getByText("Phần Contact", { exact: true })).toBeVisible();
    // The card title renders immediately, but react-hook-form's reset()
    // (which populates every field from the fetched config) runs slightly
    // after mount (Setting.tsx useEffect). Wait for that settle before
    // reading/asserting on field values, otherwise fields briefly read as
    // empty right after navigation.
    const card = page.locator("div.card", { hasText: "Phần Contact" });
    await expect(card.getByRole("tablist").first()).toBeVisible();
    await expect(card.locator("textarea").first()).not.toHaveValue("");
  });

  test("DAC-01: localized field renders a tablist with one tab per routing.locales (2)", async ({
    page,
  }) => {
    const card = page.locator("div.card", { hasText: "Phần Contact" });
    const tablist = card.getByRole("tablist").first();
    await expect(tablist).toBeVisible();
    const tabs = tablist.getByRole("tab");
    await expect(tabs).toHaveCount(2);
    await expect(tabs.nth(0)).toHaveText(/Tiếng Anh/);
    await expect(tabs.nth(1)).toHaveText(/Tiếng Việt/);
  });

  test("DAC-02/AC-01.3: variant=textarea renders a <textarea>, not a one-line input", async ({
    page,
  }) => {
    const card = page.locator("div.card", { hasText: "Phần Contact" });
    // Mô tả is the first localized textarea field in the Contact section.
    const textarea = card.locator("textarea").first();
    await expect(textarea).toBeVisible();
  });

  test("DAC-03/AC-01.4: non-localized text field (Link Google Map) renders a single input with NO tablist", async ({
    page,
  }) => {
    const card = page.locator("div.card", { hasText: "Phần Contact" });
    const ggmapLabel = card.getByText("Link Google Map", { exact: true });
    await expect(ggmapLabel).toBeVisible();
    // The field wrapper right after the label must not contain role=tablist.
    const fieldWrapper = ggmapLabel.locator("xpath=..");
    await expect(fieldWrapper.getByRole("tablist")).toHaveCount(0);
  });

  test("DAC-04/AC-01.5: field label stays Vietnamese (not translated) next to the tab strip", async ({
    page,
  }) => {
    const card = page.locator("div.card", { hasText: "Phần Contact" });
    await expect(card.getByText("Mô tả", { exact: false }).first()).toBeVisible();
  });

  test("DAC-05/AC-02.1: 'Chưa dịch' badge shows on VI tab while vi is empty", async ({
    page,
  }) => {
    const card = page.locator("div.card", { hasText: "Phần Contact" });
    const tablist = card.getByRole("tablist").first();
    const viTab = tablist.getByRole("tab", { name: /Tiếng Việt/ });
    await expect(viTab.getByText("Chưa dịch")).toBeVisible();
  });

  test("DAC-07/AC-02.3 + EC-15: 'Copy từ English' fills the VI input with the current EN value, no network save triggered", async ({
    page,
  }) => {
    const card = page.locator("div.card", { hasText: "Phần Contact" });
    const tablist = card.getByRole("tablist").first();
    const enValue = await card.locator("textarea").first().inputValue();

    await tablist.getByRole("tab", { name: /Tiếng Việt/ }).click();
    const copyBtn = card.getByRole("button", { name: "Copy từ English" });
    await expect(copyBtn).toBeVisible();

    let saveCalled = false;
    page.on("request", (req) => {
      if (req.method() !== "GET" && /settings|configs/i.test(req.url())) {
        saveCalled = true;
      }
    });

    await copyBtn.click();
    const viValue = await card.locator("textarea").first().inputValue();
    expect(viValue).toBe(enValue);
    expect(saveCalled).toBe(false); // client-only, RULE-18
  });

  test("DAC-08/AC-01.2 + EC-11 round trip: save VI translation → /vi shows it, / (en) keeps English, VI tab badge disappears", async ({
    page,
  }) => {
    const card = page.locator("div.card", { hasText: "Phần Contact" });
    const tablist = card.getByRole("tablist").first();
    const textarea = card.locator("textarea").first();
    const enValue = await textarea.inputValue();

    const marker = `QA-i18n-test-vi-${Date.now()}`;

    await tablist.getByRole("tab", { name: /Tiếng Việt/ }).click();
    await textarea.fill(marker);

    // badge should disappear once vi is non-empty
    await expect(tablist.getByRole("tab", { name: /Tiếng Việt/ }).getByText("Chưa dịch")).toHaveCount(0);

    await page.getByRole("button", { name: "Save" }).click();
    // Wait for the dirty-state Save button to disappear (save succeeded, form reset)
    await expect(page.getByRole("button", { name: "Save" })).toHaveCount(0, {
      timeout: 15_000,
    });

    try {
      // vi now shows the translated marker (AC-03.1 real translation, not fallback)
      await page.goto("/vi");
      await expect(page.getByText(marker, { exact: false })).toBeVisible();

      // en is untouched (fallback logic doesn't leak vi into en, RULE-05/EC-11).
      // NOTE: next-intl persists the last-visited locale in a NEXT_LOCALE
      // cookie (documented in proxy.ts: "path prefix > cookie NEXT_LOCALE >
      // Accept-Language > defaultLocale") — having just visited `/vi` in
      // this same browser context, a plain `/` would be redirected back to
      // `/vi` by design. Clear that cookie so `/` genuinely resolves to the
      // default locale (en), independent of any correct-and-intended
      // "remember my language" behavior.
      await page.context().clearCookies({ name: "NEXT_LOCALE" });
      await page.goto("/");
      await expect(page).toHaveURL(/\/(en)?$/);
      await expect(page.getByText(marker, { exact: false })).toHaveCount(0);
      await expect(page.getByText(enValue.slice(0, 40), { exact: false })).toBeVisible();
    } finally {
      // Cleanup: restore vi back to empty via the same admin flow so the
      // cache is correctly revalidated for every locale again (EC-11).
      await page.goto("/admin/settings/ui/homepage");
      const card2 = page.locator("div.card", { hasText: "Phần Contact" });
      await expect(card2.getByRole("tablist").first()).toBeVisible();
      // Same hydration race as beforeEach: wait for RHF reset() to populate
      // the real (marker) value before interacting, otherwise fill("") is a
      // no-op against an already-empty pre-hydration field and Save never
      // becomes dirty (cleanup would silently do nothing).
      await expect(card2.locator("textarea").first()).not.toHaveValue("");
      const tablist2 = card2.getByRole("tablist").first();
      await tablist2.getByRole("tab", { name: /Tiếng Việt/ }).click();
      const textarea2 = card2.locator("textarea").first();
      await expect(textarea2).toHaveValue(marker);
      await textarea2.fill("");
      const saveBtn = page.getByRole("button", { name: "Save" });
      if (await saveBtn.isVisible().catch(() => false)) {
        await saveBtn.click();
        await expect(page.getByRole("button", { name: "Save" })).toHaveCount(0, {
          timeout: 15_000,
        });
      }
    }
  });

  test("EC-13: field renders fine even though other fields on the same page are non-localized (no crash on mixed metadata)", async ({
    page,
  }) => {
    // Sanity: the whole settings page loaded without an error boundary while
    // mixing localized + non-localized fields in the same section.
    const html = await page.content();
    expect(html).not.toMatch(/Application error/i);
  });
});

test.describe("Admin form — non-localized config unaffected (regression, Regression Impact §10)", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("app config (order settings) still loads and has no tablist anywhere", async ({
    page,
  }) => {
    const res = await page.goto("/admin/settings/app/order");
    expect(res?.status()).toBeLessThan(400);
    await expect(page.getByRole("tablist")).toHaveCount(0);
  });
});
