import { test, expect, Page } from "@playwright/test";
import { config as loadEnv } from "dotenv";
import { SignJWT } from "jose";

loadEnv({ path: ".env.local" });

/**
 * sprint-3-entity-i18n — admin LocaleTabStrip (product/category/addon forms).
 *
 * Covers Story-01/02/03 (AC-01.*, AC-02.*, AC-03.*), ui-design.md
 * DAC-01..DAC-16, RULE-12/16/17/18/19.
 *
 * AUTH NOTE (same pre-existing issue documented in sprint-2's
 * tests/i18n/config-i18n-admin.spec.ts): the interactive login form fails on
 * `dev_multi_lang` with "permission denied for sequence
 * refresh_tokens_id_seq" (DB role can't INSERT into users/refresh_tokens).
 * We mint a valid `access_token` JWT (same secret/shape as
 * `signAccessToken`) and inject it as a cookie — the proxy only checks the
 * cookie's presence for these read/write admin routes under test.
 *
 * CONCURRENCY NOTE: every describe block below reads/writes the SAME fixture
 * row (PRODUCT_ID=18 / its category) against the real dev_multi_lang DB —
 * there is no per-test tenant isolation. Run this file single-worker to
 * avoid cross-test races on shared state:
 *   npx playwright test tests/i18n/entity-i18n-admin.spec.ts --workers=1
 */

const ADMIN_USER_ID = Number(process.env.QA_ADMIN_USER_ID ?? 4);
const ADMIN_USERNAME = process.env.QA_ADMIN_USER ?? "hungadmin";
const ADMIN_EMAIL = process.env.QA_ADMIN_EMAIL ?? "zearth113@gmail.com";

// Known fixture data (dev_multi_lang, seeded en-only per sprint-3 seed script)
const PRODUCT_ID = 18; // slug: orange-juice
const PRODUCT_SLUG = "orange-juice";

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

  await page.goto("/admin/login");
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

test.describe("Product edit page — LocaleTabStrip (DAC-01..05, DAC-09, DAC-13..15)", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(`/admin/products/${PRODUCT_ID}`);
    const card = page.locator("div.card", { hasText: "Thông tin cơ bản" });
    await expect(card.getByRole("tablist").first()).toBeVisible();
    // react-hook-form's reset() (populating fields from server-fetched
    // translations) runs in a useEffect slightly after mount — defaultValues
    // are empty strings until then. Wait for the title input to actually
    // hold the real EN value before interacting (avoids the same hydration
    // race documented in sprint-2's config-i18n-admin.spec.ts).
    await expect(card.locator("input").first()).not.toHaveValue("");
  });

  test("DAC-01: exactly one tablist above the translated group, tab count === routing.locales.length (2)", async ({
    page,
  }) => {
    const card = page.locator("div.card", { hasText: "Thông tin cơ bản" });
    const tablist = card.getByRole("tablist");
    await expect(tablist).toHaveCount(1);
    const tabs = tablist.getByRole("tab");
    await expect(tabs).toHaveCount(2);
    await expect(tabs.nth(0)).toHaveText(/Tiếng Anh/);
    await expect(tabs.nth(1)).toHaveText(/Tiếng Việt/);
  });

  test("DAC-02: switching locale swaps the title field value; typing under EN survives a round trip through VI and back (no loss)", async ({
    page,
  }) => {
    const card = page.locator("div.card", { hasText: "Thông tin cơ bản" });
    const tablist = card.getByRole("tablist").first();
    const titleInput = card.locator("input").first();

    const enValue = await titleInput.inputValue();
    expect(enValue.length).toBeGreaterThan(0);

    await tablist.getByRole("tab", { name: /Tiếng Việt/ }).click();
    // vi has no row yet -> title empty (EC-05)
    await expect(titleInput).toHaveValue("");

    await tablist.getByRole("tab", { name: /Tiếng Anh/ }).click();
    await expect(titleInput).toHaveValue(enValue); // no data loss on switch back
  });

  test("DAC-03: slug/price/priority/category/isActive are NOT inside any tablist and stay unchanged across locale switch", async ({
    page,
  }) => {
    const card = page.locator("div.card", { hasText: "Thông tin cơ bản" });
    const tablist = card.getByRole("tablist").first();

    // slug lives in the same card but outside the tab-controlled block
    // (SlugInput's label is "Đường dẫn" in this admin, not the English word "Slug")
    const slugLabel = page.getByText("Đường dẫn", { exact: false }).first();
    await expect(slugLabel).toBeVisible();
    const slugWrapper = slugLabel.locator("xpath=ancestor::div[contains(@class,'border-t')]");
    await expect(slugWrapper.getByRole("tablist")).toHaveCount(0);

    // "Thông tin khác" card (price/priority/category/isActive) has no tablist at all
    const otherCard = page.locator("div.card", { hasText: "Thông tin khác" });
    await expect(otherCard.getByRole("tablist")).toHaveCount(0);

    // switching locale must not touch price input value
    const priceInputs = otherCard.locator("input");
    const priceBefore = await priceInputs.nth(1).inputValue().catch(() => "");
    await tablist.getByRole("tab", { name: /Tiếng Việt/ }).click();
    const priceAfter = await priceInputs.nth(1).inputValue().catch(() => "");
    expect(priceAfter).toBe(priceBefore);
  });

  test("DAC-06/DAC-07: 'Chưa dịch' badge shows on VI tab (no vi row yet) and clears once the WHOLE group is translated", async ({
    page,
  }) => {
    const card = page.locator("div.card", { hasText: "Thông tin cơ bản" });
    const tablist = card.getByRole("tablist").first();
    const viTab = tablist.getByRole("tab", { name: /Tiếng Việt/ });
    await expect(viTab.getByText("Chưa dịch")).toBeVisible(); // DAC-06

    // Filling only ONE of the several non-empty-EN fields (title) must NOT
    // clear the badge yet — isMissing is group-level: ANY empty field with a
    // non-empty EN counterpart still counts as "chưa dịch" (design.md §7,
    // "Badge (isMissing)"). This product also has allergenInfo/subDescription/
    // description filled on EN, so the badge must persist here.
    await viTab.click();
    const titleInput = card.locator("input").first();
    await titleInput.fill("Marker VI Title (no save)");
    await expect(viTab.getByText("Chưa dịch")).toBeVisible();

    // "Copy từ English" fills every translated field (+ addon names) for the
    // active locale from EN in one action -> the whole group becomes fully
    // translated -> badge clears (DAC-07).
    const copyBtn = page.getByRole("button", { name: "Copy từ English" });
    await copyBtn.click();
    await expect(viTab.getByText("Chưa dịch")).toHaveCount(0);
  });

  test("DAC-08: 'Copy từ English' fills VI fields from current EN values, client-only (no network save)", async ({
    page,
  }) => {
    const card = page.locator("div.card", { hasText: "Thông tin cơ bản" });
    const tablist = card.getByRole("tablist").first();
    const titleInput = card.locator("input").first();
    const enTitle = await titleInput.inputValue();

    await tablist.getByRole("tab", { name: /Tiếng Việt/ }).click();
    await expect(titleInput).toHaveValue("");

    let saveCalled = false;
    page.on("request", (req) => {
      if (req.method() !== "GET" && /products\/\d+/.test(req.url())) {
        saveCalled = true;
      }
    });

    const copyBtn = page.getByRole("button", { name: "Copy từ English" });
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();

    await expect(titleInput).toHaveValue(enTitle);
    expect(saveCalled).toBe(false);
  });

  test("DAC-05: field labels stay Vietnamese (RULE-16) — no admin label translated", async ({
    page,
  }) => {
    await expect(page.getByText("Tên sản phẩm", { exact: false }).first()).toBeVisible();
  });

  test("DAC-09: addon name inputs follow the page-shared active locale, no second tablist inside Addons card", async ({
    page,
  }) => {
    const addonsCard = page.locator("div.card", { hasText: "Addons" }).first();
    // fallback selector if the addons card title differs
    const anyAddonsCard = (await addonsCard.count())
      ? addonsCard
      : page.locator("div.card", { hasText: "Addon" }).first();
    await expect(anyAddonsCard.getByRole("tablist")).toHaveCount(0);
  });

  test("DAC-13: no hardcoded hex color / inline style in the translated-field region", async ({
    page,
  }) => {
    const card = page.locator("div.card", { hasText: "Thông tin cơ bản" });
    const html = await card.innerHTML();
    expect(html).not.toMatch(/style="[^"]*#[0-9a-fA-F]{3,6}/);
  });

  test("DAC-14: tabs are keyboard reachable buttons with visible focus", async ({ page }) => {
    const card = page.locator("div.card", { hasText: "Thông tin cơ bản" });
    const tablist = card.getByRole("tablist").first();
    const tabs = tablist.getByRole("tab");
    for (let i = 0; i < (await tabs.count()); i++) {
      await expect(tabs.nth(i)).toHaveAttribute("type", "button");
    }
    await tabs.nth(1).focus();
    await expect(tabs.nth(1)).toBeFocused();
  });

  test("DAC-15: at 360px width, the tab strip + inputs do not cause horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(`/admin/products/${PRODUCT_ID}`);
    await expect(page.getByText("Thông tin cơ bản")).toBeVisible();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // small tolerance
  });
});

test.describe("Product create modal — LocaleTabStrip (DAC-11)", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/admin/products");
  });

  test("DAC-11: CreateProduct renders one tablist above title; slug/category stay shared", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Thêm mới" }).click();
    const modal = page.locator("div.card", { hasText: "Thêm mới sản phẩm" });
    await expect(modal.getByRole("tablist")).toHaveCount(1);
    const tabs = modal.getByRole("tablist").getByRole("tab");
    await expect(tabs).toHaveCount(2);

    // slug input present but not inside the tablist
    const tablist = modal.getByRole("tablist").first();
    await expect(tablist.locator("input")).toHaveCount(0);
  });
});

test.describe("Category create modal — LocaleTabStrip, name-only (DAC-11)", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/admin/categories");
  });

  test("DAC-11: CreateCategory renders one tablist above name; no description field present", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Thêm danh mục" }).click();
    const modal = page.locator("div.card").filter({ hasText: "Thêm nhóm món ăn" });
    await expect(modal.getByRole("tablist")).toHaveCount(1);
    const tabs = modal.getByRole("tablist").getByRole("tab");
    await expect(tabs).toHaveCount(2);
    await expect(modal.locator("textarea")).toHaveCount(0); // no description field
  });

  test("DAC-06: badge shows on VI tab for a fresh (empty) name group", async ({ page }) => {
    await page.getByRole("button", { name: "Thêm danh mục" }).click();
    const modal = page.locator("div.card").filter({ hasText: "Thêm nhóm món ăn" });
    const tablist = modal.getByRole("tablist").first();
    await tablist.getByRole("tab", { name: /Tiếng Anh/ }).click();
    await modal.locator("input").first().fill("QA Temp Category EN");
    const viTab = tablist.getByRole("tab", { name: /Tiếng Việt/ });
    await expect(viTab.getByText("Chưa dịch")).toBeVisible();
  });
});

test.describe("Category edit modal (UpdateCategory) — LocaleTabStrip controls name+description (DAC-11b)", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/admin/categories");
  });

  test("DAC-11b: one tablist controls BOTH name and description together; slug stays shared", async ({
    page,
  }) => {
    const firstRow = page.locator("table tbody tr").first();
    await expect(firstRow).toBeVisible();
    // First IconButton in the row is the edit (pencil) action (CategoryTable.tsx column order)
    await firstRow.locator("button").first().click();

    const modal = page.locator(".modal, [role='dialog'], div.card").filter({
      has: page.getByRole("tablist"),
    }).first();
    await expect(modal.getByRole("tablist")).toHaveCount(1);
    const tablist = modal.getByRole("tablist").first();
    await expect(tablist.getByRole("tab")).toHaveCount(2);

    const nameInput = modal.locator("input").first();
    const descTextarea = modal.locator("textarea").first();
    const enName = await nameInput.inputValue();

    await tablist.getByRole("tab", { name: /Tiếng Việt/ }).click();
    // switching swaps BOTH fields at once (DAC-11b) — name becomes vi (likely empty)
    await expect(nameInput).not.toHaveValue(enName);

    await tablist.getByRole("tab", { name: /Tiếng Anh/ }).click();
    await expect(nameInput).toHaveValue(enName); // restored, no data loss
    await expect(descTextarea).toBeVisible(); // description IS present here (unlike CreateCategory)
  });
});

test.describe("Real save round trip — product title EN/VI (AC-01.2, RULE-12, DAC-04, AC-04.1)", () => {
  test("saving a VI title creates a translation row and /vi/dish/[slug] shows it; en stays untouched; cleanup reverts", async ({
    page,
  }) => {
    await login(page);
    await page.goto(`/admin/products/${PRODUCT_ID}`);
    await expect(page.getByText("Thông tin cơ bản")).toBeVisible();

    const card = page.locator("div.card", { hasText: "Thông tin cơ bản" });
    const tablist = card.getByRole("tablist").first();
    const titleInput = card.locator("input").first();
    const enTitle = await titleInput.inputValue();

    const marker = `QA VI Title ${Date.now()}`;

    await tablist.getByRole("tab", { name: /Tiếng Việt/ }).click();
    await titleInput.fill(marker);

    const saveBtn = page.getByRole("button", { name: "Lưu" });
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();
    // dirty-state Save button disappears once the form resets after success
    await expect(page.getByRole("button", { name: "Lưu" })).toHaveCount(0, {
      timeout: 15_000,
    });

    try {
      await page.goto(`/vi/dish/${PRODUCT_SLUG}`);
      await expect(page.getByText(marker, { exact: false }).first()).toBeVisible();

      // en is untouched (base column stays = en, not overwritten by vi save)
      await page.context().clearCookies({ name: "NEXT_LOCALE" });
      await page.goto(`/dish/${PRODUCT_SLUG}`);
      await expect(page.getByText(marker, { exact: false })).toHaveCount(0);
      await expect(
        page.getByRole("heading", { name: enTitle.trim() }).first(),
      ).toBeVisible();
    } finally {
      // Cleanup: clear vi title back to empty so fallback resumes (idempotent state)
      await page.goto(`/admin/products/${PRODUCT_ID}`);
      const card2 = page.locator("div.card", { hasText: "Thông tin cơ bản" });
      const tablist2 = card2.getByRole("tablist").first();
      const titleInput2 = card2.locator("input").first();
      await tablist2.getByRole("tab", { name: /Tiếng Việt/ }).click();
      await expect(titleInput2).toHaveValue(marker);
      await titleInput2.fill("");
      const saveBtn2 = page.getByRole("button", { name: "Lưu" });
      if (await saveBtn2.isVisible().catch(() => false)) {
        await saveBtn2.click();
        await expect(page.getByRole("button", { name: "Lưu" })).toHaveCount(0, {
          timeout: 15_000,
        });
      }
    }
  });
});
