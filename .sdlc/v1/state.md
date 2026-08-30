# SDLC State

- **version**: v1
- **current_sprint**: sprint-1-i18n-foundation
- **current_phase**: test
- **current_task**: none
- **updated_at**: 2026-08-30 23:59

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

- **next_action**: Test leg xong (64/64 Playwright test pass, visual baseline tạo mới ở visual-baseline/). Chạy QA gate cho sprint-1-i18n-foundation. Xem `.sdlc/v1/sprint-1-i18n-foundation/test-report.md` cho phần "Needs manual verification" (5 mục) trước khi user manual test.
- **blockers**: none

## Context loaded this run (so the next run knows what to re-read)

- claude_md_relevant: (chưa có CLAUDE.md ở repo; agent tự khảo sát codebase)
- skills_used: requirements-analysis
- services_up: Supabase remote DB (schema dev_multi_lang, DATABASE_URL trong .env.local) — luôn sẵn sàng; sprint-1 KHÔNG có schema change nên không cần migration; dev server test = `next dev`
- codex_enabled: false
- has_design: yes
- ui_design_source: internal
- implement_notes: proxy.ts có 2 deviation hợp lý so với design gốc (giữ nguyên, đã cập nhật architecture.md): (1) catch-all `/admin/*` còn lại pass-through trước intl để không prefix locale (vd `/admin/register`); (2) loại trừ path tĩnh/metadata có đuôi mở rộng (`robots.txt`, `sitemap.xml`, `site.webmanifest`) + `_vercel` khỏi intl để tránh 307→404. messages/en.json + vi.json được coordinator merge tập trung (feature-builder chạy song song không ghi trực tiếp) để tránh conflict ghi file JSON dùng chung.
