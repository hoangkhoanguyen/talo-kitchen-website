# SDLC State

- **version**: v1
- **current_sprint**: sprint-4-i18n-polish
- **current_phase**: qa
- **current_task**: none
- **updated_at**: 2026-08-31

## Phase status (current sprint)

- analyze:       done
- design_system: done
- design_ui:     n/a
- tasks:         done
- execute:       done
- test:          done
- qa:            done

## Human approval gates

- analyze_approved:  true
- design_approved:   true
- tasks_approved:    true

## Resume pointer

- **next_action**: sprint-4-i18n-polish IMPLEMENT DONE (14/14 tasks). Wave 1 (TASK-01..04: i18n-meta.ts,
  metadata namespace en/vi, date-web.ts TZ-safe, formatCurrencyWebsite locale param) + Wave 2
  (TASK-05..13: 6 pages' generateMetadata refactored to use i18n-meta helpers + metadata namespace
  fallback, sitemap alternates.languages, 9 client + 5 server formatCurrencyWebsite callsites passing
  locale, ReservationSubmitSuccess moved off moment) + Wave 3 (TASK-14: fallback sweep + hardcode scan
  + final build gate) all done and committed on `feature/multi-language` (commits 8a1f5fc..HEAD, see
  `git log --grep='sprint-4-i18n-polish'`). Verify gate: `npx tsc --noEmit` = 0 errors, `npx next build`
  PASS (22 app routes incl. `/[locale]/cart` and `/[locale]/checkout` now dynamic with generateMetadata).
  Hardcode sweep: grep clean except 2 pre-existing DEAD/unused files not reachable in the app
  (`src/components/web/Story.tsx` "Story" h1, `ContactSection.tsx`'s unused `openingHoursConfigs` const,
  `GallerySection.tsx`'s unused `galleryImages` const — none are imported/rendered anywhere, actual
  render always uses the DB config prop which IS localized via sprint-2; left untouched as out-of-scope
  pre-existing dead code, not a sprint-4 regression). `messages/en.json`/`vi.json` key sets fully
  symmetric (0 missing either direction). `<html lang={locale}>` confirmed in `[locale]/layout.tsx`
  (NFR-06). `formatCurrency` (admin) + `lib/date.ts formatDateVN` (admin) confirmed untouched — 0 admin
  files modified in this sprint's diff.
- **sprint-4-i18n-polish TEST LEG DONE** (2026-08-31). New unit tests `tests/unit/currency-web.test.ts`
  (8/8) + `tests/unit/i18n-meta.test.ts` (11/11); new Playwright `tests/i18n/sprint4-seo-polish.spec.ts`
  (15/15, covers all 6 metadata pages + hreflang + sitemap + fallback + no-runtime-error sweep). Full
  regression `tests/i18n/*` re-run `--workers=1` = 135/135 pass; `tests/unit/*` = 51/52 (1 pre-existing
  `entity-translations.test.ts` failure confirmed unrelated to sprint-4, fails identically on commit
  `8a1f5fc` before this sprint started — server-only import when run outside Next runtime, harness gap
  not a product bug); `tsc --noEmit` 0 errors; `next build` PASS. **Found + fixed 1 real bug** (1 fix
  round, Sonnet, no Opus escalation): `dish/[slug]/page.tsx` calls `notFound()` when product missing,
  which per Next.js App Router semantics DISCARDS that route's own `generateMetadata` (its
  `t("dish.notFound")` fallback branch was dead code) and falls back to the shared
  `(web)/[locale]/not-found.tsx` boundary's metadata instead — which had NO `generateMetadata` at all,
  so every 404 showed the static untranslated root-layout title regardless of locale (violated
  AC-01.4/EC-01). Fixed by adding `generateMetadata` to `not-found.tsx` using the existing `notFound`
  messages namespace + `resolveLocale` + `getOgLocale`. Also updated 1 pre-existing sprint-3 assertion
  in `tests/i18n/entity-i18n-user.spec.ts` (price string-equality across locale) to numeric-equality,
  since sprint-4 INTENTIONALLY makes price display grouping differ per locale (AC-05.1/05.2) while the
  value stays the same (AC-05.3) — this was an outdated test assumption, not a code defect. Full mapping
  + manual-verification list (reservation E2E visual, social-share preview, GSC hreflang validation —
  all genuinely un-automatable pre-deploy) in `.sdlc/v1/sprint-4-i18n-polish/test-report.md`. Next: QA
  gate for sprint-4-i18n-polish — LAST sprint of v1, after QA v1 is fully done.
- (sprint-3-entity-i18n TEST LEG DONE, historical) — unit (21/21) + Playwright user-facing (16/16) +
  Playwright admin LocaleTabStrip (15/15, run `--workers=1`, shares fixture row PRODUCT_ID=18) +
  visual-baseline (6/6) all green; full `tests/i18n/` regression suite (114/114) + tsc (0 lỗi) + `next build`
  PASS. Found + fixed 1 real bug during test leg: LocaleTabStrip's dynamically-named Controllers
  (`translations.${activeLocale}.*`) didn't actually update the displayed value on tab switch — fixed by
  adding `key={`field-${activeLocale}`}` to force remount in ProductEditForm/AddonsEditor/CreateProduct/
  CreateCategory/UpdateCategory (1 fix round, Sonnet, no Opus escalation). See
  `.sdlc/v1/sprint-3-entity-i18n/test-report.md` for full AC/EC/DAC mapping + manual-verification list.
  Next: QA gate for sprint-3-entity-i18n.
- (sprint-3 implement notes, còn hiệu lực cho Test/QA)
  1. `upsertProductTranslations`/`upsertCategoryTranslations`/`upsertAddonTranslations` (src/services/products/
     translations.ts) có chữ ký `(entityId, record, tx?)` — `tx` Ở CUỐI.
  2. `src/app/(admin)/admin/(dashboard)/products/[id]/page.tsx` được cập nhật trong TASK-17 (build default
     values `translations` qua `src/lib/mappings/products.ts`, tách ra khỏi hook để tránh xung đột
     server-only import boundary) dù không nằm trong Expected files gốc của task nào.
  3. Role DB dev role (`dev_test_user`) thiếu quyền `CREATE SCHEMA` + quyền trên 1 sequence legacy
     (`__drizzle_migrations_id_seq` trỏ `prod` cũ) — migration TASK-02 phải áp dụng bằng script thủ công
     thay vì `drizzle-kit migrate` binary trực tiếp (chi tiết dưới `known_issue`). Sprint sau nếu cần thêm
     migration DB thật, lặp lại cách này.
  4. `drizzle.config.ts` `migrations.schema` đã đổi từ hardcode `"prod"` → `process.env.DB_SCHEMA || "prod"`.
  5. `meta/0000_snapshot.json` đã reconcile field `schema` từ "prod" → "dev_multi_lang" (metadata-only, không
     re-run migration 0000) — nếu tạo migration mới trong tương lai, snapshot này là baseline đúng, không cần
     sửa lại.
- (sprint-2-config-i18n) next_action cũ: QA gate DONE (1 fix round). Full checklist re-run clean: 25/25 unit + 83/83 Playwright pass, `tsc --noEmit` sạch, `next build` PASS, migration re-run trên dev_multi_lang idempotent + English 100% nguyên vẹn + config app/non-localized không đụng (verify trực tiếp bằng SQL). Backward-compat helper (`normalizeLocalized`/`resolveLocalizedString` coi string chưa migrate = bản en, không crash) đã confirm là điều kiện đủ để deploy code trước / migrate sau trên prod. Đã tự fix 1 cosmetic bug (`SettingNumberField.tsx` leak `isRequired` xuống DOM) vì trivial 1-file fix, re-run full suite xanh lại sau fix, đã commit. Sprint sẵn sàng handoff cho manual test.
- **qa_notes (sprint-4-i18n-polish, 2026-08-31, qa-guard, LAST sprint of v1)**: QA gate DONE, 1/6 fix
  rounds used (Sonnet, no Opus escalation), commit `5f1673d`. Re-ran full checklist: `npx tsc --noEmit`
  0 lỗi; `npx next build` PASS (23 route, includes new `/[locale]/[...rest]`); unit `tests/unit/*.test.ts`
  51/52 (1 pre-existing `entity-translations.test.ts` harness-only failure, re-confirmed identical via
  `git stash` diff against HEAD — NOT a sprint-4 regression); Playwright `tests/i18n/*` full regression
  `--workers=1` 135/135 pass (re-run AFTER the fix below, still green). Verified via real HTTP/HTML
  (curl on `next build && next start`, not just reading test code): all 6 in-scope pages
  (home/menu/dish/reservation/checkout/cart) × 2 locales have correct `<title>`, `og:locale`
  (en_US/vi_VN), self-referencing `canonical`, full `alternates.languages` (en/vi/x-default,
  as-needed URL scheme), `<html lang>` matching locale; `sitemap.xml` has `xhtml:link` alternates on
  every entry, category label "All" confirmed never leaks into XML output (only `key` reaches the URL);
  currency renders `449,000 VND` (en) vs `449.000 VND` (vi) on the real menu page, same underlying
  value; admin `formatCurrency`/`formatDateVN` confirmed untouched (0 admin files in sprint-4 diff,
  admin callsites don't pass `locale` so keep default `vi-VN` behavior); admin login/dashboard
  redirect-to-login behavior intact (regression OK).
  **Found + fixed 1 real bug** (round 1/6): a genuinely unmatched URL under a locale prefix
  (e.g. `/vi/some-typo`, `/some-typo` — the single most common 404 a real user hits, distinct from
  the EC-01 "product not found" case sprint-4's test leg already fixed) matched NO route at all under
  `(web)/[locale]/**`, so Next.js never entered the `[locale]` layout tree and fell back to the app's
  ROOT `src/app/not-found.tsx` — hardcoded English title/body, no `<html lang>` attribute at all,
  regardless of the `/vi/...` URL the user typed. Fixed by adding
  `src/app/(web)/[locale]/[...rest]/page.tsx` (calls `notFound()`) so any unmatched path is captured
  inside the `[locale]` segment and correctly resolves to the already locale-aware
  `(web)/[locale]/not-found.tsx` boundary (verified: en → "Page Not Found", vi → "Không tìm thấy
  trang"). Re-ran the full checklist after the fix — still 100% green, no regression on the 6 real
  pages or on `next build` route list.
  **Known limitation, NOT fixed (framework-level, pre-existing, out of proportionate scope)**: for
  ANY page reached via `notFound()` (both the fixed generic case above AND the pre-existing
  dish/[slug] "product not found" case from the test leg), Next.js 16's App Router renders a minimal
  `<html id="__next_error__">` shell that does NOT carry the `lang` attribute from the `[locale]`
  layout — confirmed identically in `next build && next start` (not a dev-only artifact) and
  identically for en/vi (so it's an a11y/NFR-06 gap, not a locale-CORRECTNESS bug — the title/body
  text IS correctly localized in both cases). This does not affect any of the 6 required
  Story-01..04 pages (confirmed `<html lang>` correct on all 12 combinations via curl). Flagging for
  the team; would need a deeper Next.js-version-specific investigation to fix and is not part of this
  sprint's AC/EC scope (the 6 listed metadata pages + EC-01's specific "product not found" wording).
  Manual-verification carryover unchanged from test-report.md (reservation E2E visual, social-share
  preview, GSC hreflang — all genuinely un-automatable pre-deploy).
  **v1 ACCEPTANCE (whole version) confirmed**: language switcher changes URL as-needed + persists via
  `NEXT_LOCALE` cookie on refresh (sprint-1 regression, 15/15 pass); all content types (product/
  category/section/menu/reservation/buttons/SEO) resolve per locale with safe English fallback
  (sprint-2/3 regression, config-i18n + entity-i18n suites all green); admin remains Vietnamese-only,
  can input en+vi for product/category/addon (LocaleTabStrip) + every settings page (sprint-2/3
  regression); old English data intact (unchanged by any sprint-4 diff — 0 migration/schema in this
  sprint); no leftover English hardcode user-side (`static-checks.spec.ts` green + manual scan of
  `src/app/(web)/[locale]/**`, `src/components/web/**` — only 2 pre-existing DEAD/unreachable files
  flagged in earlier sprints, confirmed still unreachable).
  **Whole-version deploy readiness**: code-complete and QA-clean on all 4 sprints. Two OPS (not code)
  blockers carry over unchanged: (1) dev DB role permission gap blocks manual admin login on
  `dev_multi_lang` (pre-existing, see `known_issue` below — needs a GRANT or a seeded admin account
  to manually test admin flows); (2) real Vietnamese content for `seo.*`/product/category/addon
  fields has not been entered by admin yet (content/ops task, not a code gap — fallback-to-English
  is verified working in the meantime). Deploy order for prod unchanged from sprint-2/3 notes below:
  `db:migrate` → `seed:entities-i18n` → deploy code → `migrate:configs-i18n`.
- **blockers**: none
- **qa_notes**: report đầy đủ ở `.sdlc/v1/sprint-2-config-i18n/test-report.md` (test leg) + báo cáo QA trong hội thoại /sdlc:test agent qa-guard (2026-08-31). Còn lại cho user verify thủ công: (1) login admin thật trên dev_multi_lang bị chặn bởi lỗi quyền DB role (permission denied sequence refresh_tokens_id_seq/users_id_seq) — pre-existing, KHÔNG phải do sprint-2; cần cấp quyền INSERT/sequence cho role dev hoặc seed sẵn tài khoản admin để test tay được. (2) Nội dung vi thật cho toàn bộ field RULE-20..23 chưa được nhập (đúng — đây là content/ops task, không phải code task của sprint này).
- **qa_notes (sprint-3-entity-i18n, 2026-08-31, qa-guard)**: QA gate DONE, 0 fix rounds needed (test leg đã sạch từ trước, không tìm thêm bug). Re-run toàn bộ checklist: `npx tsc --noEmit` 0 lỗi; `npx next build` PASS (22 route); unit `tests/unit/entity-translations.test.ts` 21/21 + `tests/unit/localized-config.test.ts` 25/25; Playwright `tests/i18n/` (toàn bộ, `--workers=1`) 120/120 pass (gồm entity-i18n-admin 15, entity-i18n-user 16, entity-i18n-visual-baseline 6, + regression sprint-1/2 đầy đủ). Xác nhận trực tiếp bằng SQL trên `dev_multi_lang`: `products`=40/`product_translations(en)`=40, `product_categories`=4/`product_category_translations(en)`=4, `product_addons`=15/`product_addon_translations(en)`=15 (1:1, AC-06.2); migration SQL (`src/db/migration/0001_flashy_morbius.sql`) CHỈ có `CREATE TABLE`+`ALTER...ADD CONSTRAINT FK CASCADE`, KHÔNG đụng cột gốc (AC-06.1/NFR-03); vi row test fixture (product id=18) đã cleanup đúng (empty string, không xoá row, EN base column "Orange Juice" nguyên vẹn). Xác nhận fix bug LocaleTabStrip remount (`key={...-${activeLocale}}`) có mặt ở cả 5 file (ProductEditForm/AddonsEditor/CreateProduct/CreateCategory/UpdateCategory). Scan sạch: không TODO/FIXME mới trong sprint-3 diff, không hardcode secret/URL, `console.log` chỉ ở CLI scripts (intentional output) + 5 chỗ trong `actions/admin/{product,category}.ts` là pattern lỗi PRE-EXISTING (không phải sprint-3 gây ra, verify bằng git show ở commit trước sprint). Addon add-remove-before-save (AC-02.3) xác nhận KHÔNG orphan by construction (đọc code `updateProductById`: `upsertAddonTranslations` chỉ gọi SAU khi có `insertedAddon.id` từ tx INSERT, addon bị xoá ở client trước submit không bao giờ vào `newAddons`). Backward-compat "deploy code trước, migrate sau" = **BẮT BUỘC migrate schema TRƯỚC khi deploy code sprint-3** (không như sprint-2): resolver không throw với giá trị null/rỗng/thiếu row, NHƯNG nếu 3 bảng `*_translations` chưa tồn tại, Drizzle relational `with: { translations }` sẽ lỗi ở tầng query (bảng không tồn tại) — đây là ops/deploy-order concern, không phải code-level guard. Thứ tự deploy đúng: `db:generate`+`db:migrate` (tạo 3 bảng) → `seed:entities-i18n` (backup + idempotent) → deploy code mới. Không tìm thấy lỗi nào cần fix (0/6 fix rounds dùng). Sprint sẵn sàng handoff cho manual test.

## Context loaded this run (so the next run knows what to re-read)

- claude_md_relevant: (chưa có CLAUDE.md ở repo; agent tự khảo sát codebase)
- skills_used: requirements-analysis
- services_up: Supabase remote DB (schema dev_multi_lang, DATABASE_URL trong .env.local) — luôn sẵn sàng; sprint-2 CÓ migration JSON config (không đổi schema DB bảng, chỉ đổi cấu trúc JSON trong bảng configs); dev server test = `next dev`
- codex_enabled: false
- has_design: yes
- ui_design_source: internal
- run_mode: AUTONOMOUS — user yêu cầu "chạy cho đến khi hết sprint, no human gate". Auto-approve analyze/design/tasks. Chỉ dừng khi BLOCKED thật hoặc context đầy.
- DECISION (2026-08-31, user): đổi `localePrefix` từ `always` → **`as-needed`** (en KHÔNG prefix, giữ URL cũ `/menu`; chỉ `/vi/...` có prefix) để giảm xáo trộn SEO khi cắt prod. Áp SAU khi vá build sprint-2, TRƯỚC Test/QA sprint-2. Cần: sửa `src/i18n/routing.ts` localePrefix; rà middleware `proxy.ts` + language switcher; CẬP NHẬT test sprint-1 (routing.spec/middleware-detect.spec đang assert `/`→`/en` kiểu always) + architecture.md. EC-03 (locale không hợp lệ) vẫn phải 404.
- DEPLOY STRATEGY (user context): web trên Vercel, DB Supabase, prod dùng schema `prod` (DB_SCHEMA mặc định). Khuyến nghị blue/green theo schema: clone prod→prod_v2, migrate trên đó, Vercel preview trỏ DB_SCHEMA=prod_v2, cắt bằng đổi env, rollback = flip về prod. Chạy migrate:configs-i18n với DB_SCHEMA=prod (sprint-2) + Drizzle migration bảng *_translations (sprint-3) trên prod. Verify helper resolve coi string chưa migrate = bản en (backward-compat) trong QA.
- sprint_1_done: sprint-1-i18n-foundation hoàn tất. next-intl + [locale] routing (as-needed) + messages en/vi + language switcher.
- sprint_2_done: sprint-2-config-i18n hoàn tất (commit tới 2264543). Config ui localized `{en,vi}` + migration đã chạy trên dev_multi_lang + renderer admin tab strip + service resolve per-locale + cache per-locale. Backward-compat verified (string chưa migrate = en). Fix bug revalidate.ts (revalidateTag expire:0).
- sprint_3_done: sprint-3-entity-i18n hoàn tất (commit ddb34aa→ec26f5d). 3 bảng translation (product/category/addon) + migration schema THẬT + seed en (40/4/15) trên dev_multi_lang; service resolve theo locale + fallback cột gốc + cache per-locale; admin LocaleTabStrip cho product/category/addon form; cart/quick-cart/API localize. orders KHÔNG đụng (snapshot text). 158 test pass.
- DEPLOY ORDER (khác nhau giữa 2 sprint!): sprint-2 (config JSON) = deploy code TRƯỚC, migrate SAU đều được (resolver coi string = en). sprint-3 (entity tables) = PHẢI migrate+seed TRƯỚC rồi mới deploy code (query relational `with translations` lỗi nếu bảng chưa tồn tại). Trên prod: db:migrate → seed:entities-i18n → deploy code → migrate:configs-i18n (config có thể sau).
- known_issue: role DB dev_multi_lang thiếu quyền sequence users_id_seq/refresh_tokens_id_seq → không INSERT users/refresh_tokens (không login admin thủ công được trên dev). Không chặn SDLC (configs OK). Cần GRANT hoặc seed admin.
- known_issue (mở rộng, sprint-3 TASK-02): role `dev_test_user` cũng thiếu quyền trên `__drizzle_migrations_id_seq`
  (sequence này còn trỏ tới schema `prod` cũ — không tồn tại/không truy cập được từ role hiện tại) VÀ thiếu quyền
  `CREATE SCHEMA` trên database (nên `drizzle-kit migrate` tự chạy `CREATE SCHEMA IF NOT EXISTS` sẽ luôn lỗi
  "permission denied for database postgres" dù schema đã tồn tại). Đã fix 2 việc: (1) `drizzle.config.ts`
  `migrations.schema` đổi từ hardcode `"prod"` → `process.env.DB_SCHEMA || "prod"` (đồng bộ `src/db/schema.ts`);
  (2) migration 0001 áp dụng THỦ CÔNG qua script một lần (không dùng `drizzle-kit migrate` binary trực tiếp vì nó
  luôn thử `CREATE SCHEMA`) — apply đúng SQL sinh bởi `drizzle-kit generate` trong 1 transaction + insert
  tracking row vào `dev_multi_lang.__drizzle_migrations` với `id` chỉ định tường minh (tránh gọi `nextval()` trên
  sequence không có quyền). Đã reconcile `meta/0000_snapshot.json` (chỉ sửa field `schema` từ "prod" →
  "dev_multi_lang" để khớp thực tế deploy, KHÔNG re-run migration 0000) để tránh drizzle-kit hỏi "rename table"
  nhầm trên 15 bảng cũ khi generate. **Cho migration DB kế tiếp (sprint sau)**: nếu lại dùng `drizzle-kit migrate`
  trực tiếp và gặp lỗi permission tương tự, lặp lại cách áp dụng thủ công này (đọc `meta/_journal.json` lấy
  hash+timestamp, chạy statement trong transaction, insert tracking row với id tường minh).

## Sprint-1 implement notes (còn hiệu lực cho các sprint sau)

- proxy.ts có 2 deviation hợp lý so với design gốc (đã ghi architecture.md): (1) catch-all `/admin/*` pass-through trước intl; (2) loại trừ path tĩnh/metadata (`robots.txt`, `sitemap.xml`, `site.webmanifest`, `_vercel`) khỏi intl.
- messages/en.json + vi.json: khi nhiều agent song song đụng cùng file JSON dùng chung → coordinator merge tập trung, feature-builder chỉ report key, KHÔNG ghi trực tiếp (tránh conflict).
- eslint repo hỏng sẵn (TypeError circular JSON) — verify bằng tsc + next build, bỏ qua eslint.
- i18n module: `src/i18n/routing.ts` (locales `['en','vi']`, defaultLocale en, localePrefix always), `src/i18n/navigation.ts`, `src/i18n/request.ts`. Messages ở `messages/*.json` (root).
