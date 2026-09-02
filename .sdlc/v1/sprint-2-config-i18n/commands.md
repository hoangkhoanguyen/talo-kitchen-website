# Commands — sprint-2-config-i18n

Chạy từng task riêng (theo thứ tự / wave trong `tasks.md`):

```
/sdlc:task v1 sprint-2-config-i18n TASK-01
/sdlc:task v1 sprint-2-config-i18n TASK-02
/sdlc:task v1 sprint-2-config-i18n TASK-03
/sdlc:task v1 sprint-2-config-i18n TASK-04
/sdlc:task v1 sprint-2-config-i18n TASK-05
/sdlc:task v1 sprint-2-config-i18n TASK-06
/sdlc:task v1 sprint-2-config-i18n TASK-07
/sdlc:task v1 sprint-2-config-i18n TASK-08
/sdlc:task v1 sprint-2-config-i18n TASK-09
/sdlc:task v1 sprint-2-config-i18n TASK-10
/sdlc:task v1 sprint-2-config-i18n TASK-11
/sdlc:task v1 sprint-2-config-i18n TASK-12
```

Chạy toàn bộ sprint (pre-flight → implement theo wave → test + QA gate):

```
/sdlc:execute v1 sprint-2-config-i18n
```

## Waves (execute chạy song song trong cùng wave)
- Wave 1: TASK-01
- Wave 2: TASK-02, TASK-03, TASK-04, TASK-05, TASK-06
- Wave 3: TASK-07, TASK-08, TASK-10, TASK-11
- Wave 4: TASK-09, TASK-12

## Ghi chú vận hành
- Verify build bằng `tsc --noEmit` + `next build` (eslint repo hỏng sẵn — KHÔNG dùng để gate).
- TASK-07 (migration) chạy trên `DB_SCHEMA=dev_multi_lang`, có backup + rollback; PHẢI sau TASK-03..06.
- Đổi chữ ký `getUIConfigsByKeyCached(key, locale)` (TASK-08) → phải xong 8 call-site (TASK-09) trước khi build.
