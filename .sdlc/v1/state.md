# SDLC State

- **version**: v1
- **current_sprint**: sprint-2-config-i18n
- **current_phase**: test
- **current_task**: none
- **updated_at**: 2026-08-31 15:30

## Phase status (current sprint)

- analyze:       done
- design_system: done
- design_ui:     done
- tasks:         done
- execute:       done
- test:          done
- qa:            todo

## Human approval gates

- analyze_approved:  true
- design_approved:   true
- tasks_approved:    true

## Resume pointer

- **next_action**: Test leg sprint-2-config-i18n DONE — 25/25 unit test + 83/83 Playwright pass (kể cả toàn bộ regression sprint-1), `tsc --noEmit` sạch, `next build` PASS. Migration re-run trên dev_multi_lang xác nhận idempotent. Tìm + tự fix 1 bug thật trong lúc test (xem test-report.md): `src/lib/revalidate.ts` gọi `revalidateTag(tag, "default")` không thực sự invalidate cache `unstable_cache` (Next 16 coi "default" là cache-life profile không tồn tại → rơi vào nhánh soft-revalidate) — chặn EC-11/AC-05.2 (và thật ra chặn MỌI revalidate trong app từ trước, không riêng sprint-2). Đã sửa thành `revalidateTag(tag, { expire: 0 })`, verify lại bằng real admin save → /vi round trip + full suite xanh lại. Sẵn sàng chuyển sang QA gate cho sprint-2-config-i18n.
- **blockers**: none
- **test_leg_notes**: report đầy đủ ở `.sdlc/v1/sprint-2-config-i18n/test-report.md` (AC/EC/NFR/DAC → test mapping, needs-manual-verification, undefined edge cases). Cần biết cho QA: (1) login admin thật trên dev_multi_lang đang lỗi "permission denied for sequence refresh_tokens_id_seq/users_id_seq" — KHÔNG phải do sprint-2, là quyền DB role trên schema dev; test admin dùng cookie JWT tự ký (cùng secret `ACCESS_TOKEN_JWT_SECRET`) để bypass, đã verify tương đương. (2) Đã tìm thấy 1 bug pre-existing KHÔNG sửa (ngoài phạm vi sprint-2): `SettingNumberField.tsx` leak prop `isRequired` xuống DOM (console warning, không vỡ chức năng) — field number, không phải text/textarea nên ngoài scope RULE-01.

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
- sprint_1_done: sprint-1-i18n-foundation hoàn tất (commit 9fb0b15→c1c05c0 trên branch feature/multi-language). next-intl + [locale] routing + messages en/vi + language switcher đã có. Nội dung động (configs/products) CHƯA localize.

## Sprint-1 implement notes (còn hiệu lực cho các sprint sau)

- proxy.ts có 2 deviation hợp lý so với design gốc (đã ghi architecture.md): (1) catch-all `/admin/*` pass-through trước intl; (2) loại trừ path tĩnh/metadata (`robots.txt`, `sitemap.xml`, `site.webmanifest`, `_vercel`) khỏi intl.
- messages/en.json + vi.json: khi nhiều agent song song đụng cùng file JSON dùng chung → coordinator merge tập trung, feature-builder chỉ report key, KHÔNG ghi trực tiếp (tránh conflict).
- eslint repo hỏng sẵn (TypeError circular JSON) — verify bằng tsc + next build, bỏ qua eslint.
- i18n module: `src/i18n/routing.ts` (locales `['en','vi']`, defaultLocale en, localePrefix always), `src/i18n/navigation.ts`, `src/i18n/request.ts`. Messages ở `messages/*.json` (root).
