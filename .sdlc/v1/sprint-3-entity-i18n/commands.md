# Commands — sprint-3-entity-i18n

Chạy từng task riêng (theo thứ tự / wave trong `tasks.md`):

```
/sdlc:task v1 sprint-3-entity-i18n TASK-01
/sdlc:task v1 sprint-3-entity-i18n TASK-02
/sdlc:task v1 sprint-3-entity-i18n TASK-03
/sdlc:task v1 sprint-3-entity-i18n TASK-04
/sdlc:task v1 sprint-3-entity-i18n TASK-05
/sdlc:task v1 sprint-3-entity-i18n TASK-06
/sdlc:task v1 sprint-3-entity-i18n TASK-07
/sdlc:task v1 sprint-3-entity-i18n TASK-08
/sdlc:task v1 sprint-3-entity-i18n TASK-09
/sdlc:task v1 sprint-3-entity-i18n TASK-10
/sdlc:task v1 sprint-3-entity-i18n TASK-11
/sdlc:task v1 sprint-3-entity-i18n TASK-12
/sdlc:task v1 sprint-3-entity-i18n TASK-13
/sdlc:task v1 sprint-3-entity-i18n TASK-14
/sdlc:task v1 sprint-3-entity-i18n TASK-15
/sdlc:task v1 sprint-3-entity-i18n TASK-16
/sdlc:task v1 sprint-3-entity-i18n TASK-17
/sdlc:task v1 sprint-3-entity-i18n TASK-18
/sdlc:task v1 sprint-3-entity-i18n TASK-19
```

Chạy toàn bộ sprint (pre-flight → implement theo wave → test + QA gate):

```
/sdlc:execute v1 sprint-3-entity-i18n
```

## Waves (execute chạy song song trong cùng wave)
- Wave 1: TASK-01, TASK-04, TASK-15
- Wave 2: TASK-02
- Wave 3: TASK-03, TASK-05, TASK-14
- Wave 4: TASK-06, TASK-09, TASK-16
- Wave 5: TASK-07, TASK-08
- Wave 6: TASK-10, TASK-11, TASK-12, TASK-13, TASK-19
- Wave 7: TASK-17, TASK-18

## Ghi chú vận hành
- Verify build bằng `tsc --noEmit` + `next build` (eslint repo hỏng sẵn — KHÔNG dùng để gate).
- Migration là schema THẬT: TASK-02 (`db:generate` + REVIEW SQL chỉ CREATE 3 bảng, KHÔNG ALTER/DROP cột
  gốc → `db:migrate`) và TASK-03 (seed en) PHẢI chạy THẬT trên `DB_SCHEMA=dev_multi_lang` + verify DB
  (3 bảng + UNIQUE + FK cascade, seed en đủ, cột gốc nguyên, idempotent). Backup trước; rollback = DROP 3
  bảng CASCADE.
- TASK-01 → TASK-02 → TASK-03 TUẦN TỰ (không cùng wave).
- TASK-06 và TASK-07 cùng file `src/services/products.ts` → TASK-07 sau TASK-06 (không chạy song song).
- Đổi chữ ký service (TASK-06 products.ts, TASK-08 cached, TASK-09 cart) → phải xong hết call-site
  (TASK-10/11/12/13) + actions (TASK-19) trước khi build pass.
- KHÔNG đụng: config (sprint-2), schema/service orders (snapshot text), cột gốc bảng chính, FK bảng chính,
  home page (không render product).
