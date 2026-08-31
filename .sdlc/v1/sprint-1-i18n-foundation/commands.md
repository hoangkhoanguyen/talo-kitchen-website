# Commands — sprint-1-i18n-foundation (v1 i18n)

## Run toàn bộ sprint (run-to-completion)

```
/sdlc:execute v1 sprint-1-i18n-foundation
```

Chạy tuần tự theo dependency waves, tự commit + cập nhật `tasks.md`/`state.md` sau mỗi task, kết thúc bằng Test + QA gate.

## Chạy từng task riêng lẻ

> Thứ tự thực thi (theo dependency). Task cùng Wave chạy song song được.

### Wave 1 — foundation (sequential)
```
/sdlc:task v1 sprint-1-i18n-foundation TASK-01   # cài next-intl + module i18n (routing/navigation/request) + plugin next.config
/sdlc:task v1 sprint-1-i18n-foundation TASK-02   # messages/en.json + vi.json (khung namespace)
```

### Wave 2 — move + middleware (song song, sau Wave 1)
```
/sdlc:task v1 sprint-1-i18n-foundation TASK-03   # move page/layout → [locale]/ + rewrite layout (html lang, provider, guard)
/sdlc:task v1 sprint-1-i18n-foundation TASK-05   # proxy.ts compose auth admin + skip /api + intl middleware
```

### Wave 3 — not-found + navigation (sau TASK-03)
```
/sdlc:task v1 sprint-1-i18n-foundation TASK-04   # [locale]/not-found.tsx (dịch, không render <body>)
/sdlc:task v1 sprint-1-i18n-foundation TASK-06   # đổi 23 file import nav → @/i18n/navigation
```

### Wave 4 — language switcher (sau TASK-06)
```
/sdlc:task v1 sprint-1-i18n-foundation TASK-07   # LanguageSwitcher (router.replace + useSearchParams) + wire Header
```

### Wave 5 — trích chuỗi Loại C (song song, sau TASK-03 + TASK-02)
```
/sdlc:task v1 sprint-1-i18n-foundation TASK-08   # extract reservation/*
/sdlc:task v1 sprint-1-i18n-foundation TASK-09   # extract checkout/*
/sdlc:task v1 sprint-1-i18n-foundation TASK-10   # extract cart/*
/sdlc:task v1 sprint-1-i18n-foundation TASK-11   # extract products/*
/sdlc:task v1 sprint-1-i18n-foundation TASK-12   # extract home/*
/sdlc:task v1 sprint-1-i18n-foundation TASK-13   # extract menu/*
/sdlc:task v1 sprint-1-i18n-foundation TASK-14   # extract shared/*
/sdlc:task v1 sprint-1-i18n-foundation TASK-15   # extract ui/button/* + page-level literals
```

### Wave 6 — final sweep (sau tất cả extraction)
```
/sdlc:task v1 sprint-1-i18n-foundation TASK-16   # sweep hardcode còn sót + verify fallback/EC-12 + update architecture.md
```
