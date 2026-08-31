# SDLC State

- **version**: v1
- **current_sprint**: sprint-2-config-i18n
- **current_phase**: qa
- **current_task**: none
- **updated_at**: 2026-08-31 16:10

## Phase status (current sprint)

- analyze:       done
- design_system: done
- design_ui:     done
- tasks:         done
- execute:       done
- test:          done
- qa:            done

## Human approval gates

- analyze_approved:  true
- design_approved:   true
- tasks_approved:    true

## Resume pointer

- **next_action**: QA gate sprint-2-config-i18n DONE (1 fix round). Full checklist re-run clean: 25/25 unit + 83/83 Playwright pass, `tsc --noEmit` sạch, `next build` PASS, migration re-run trên dev_multi_lang idempotent + English 100% nguyên vẹn + config app/non-localized không đụng (verify trực tiếp bằng SQL). Backward-compat helper (`normalizeLocalized`/`resolveLocalizedString` coi string chưa migrate = bản en, không crash) đã confirm là điều kiện đủ để deploy code trước / migrate sau trên prod. Đã tự fix 1 cosmetic bug (`SettingNumberField.tsx` leak `isRequired` xuống DOM) vì trivial 1-file fix, re-run full suite xanh lại sau fix, đã commit. Sprint sẵn sàng handoff cho manual test.
- **blockers**: none
- **qa_notes**: report đầy đủ ở `.sdlc/v1/sprint-2-config-i18n/test-report.md` (test leg) + báo cáo QA trong hội thoại /sdlc:test agent qa-guard (2026-08-31). Còn lại cho user verify thủ công: (1) login admin thật trên dev_multi_lang bị chặn bởi lỗi quyền DB role (permission denied sequence refresh_tokens_id_seq/users_id_seq) — pre-existing, KHÔNG phải do sprint-2; cần cấp quyền INSERT/sequence cho role dev hoặc seed sẵn tài khoản admin để test tay được. (2) Nội dung vi thật cho toàn bộ field RULE-20..23 chưa được nhập (đúng — đây là content/ops task, không phải code task của sprint này).

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
