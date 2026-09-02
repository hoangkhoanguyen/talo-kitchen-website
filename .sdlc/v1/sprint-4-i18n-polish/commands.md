# Commands — sprint-4-i18n-polish (SPRINT CUỐI v1)

Chạy từng task riêng (theo thứ tự / wave trong `tasks.md`):

```
/sdlc:task v1 sprint-4-i18n-polish TASK-01
/sdlc:task v1 sprint-4-i18n-polish TASK-02
/sdlc:task v1 sprint-4-i18n-polish TASK-03
/sdlc:task v1 sprint-4-i18n-polish TASK-04
/sdlc:task v1 sprint-4-i18n-polish TASK-05
/sdlc:task v1 sprint-4-i18n-polish TASK-06
/sdlc:task v1 sprint-4-i18n-polish TASK-07
/sdlc:task v1 sprint-4-i18n-polish TASK-08
/sdlc:task v1 sprint-4-i18n-polish TASK-09
/sdlc:task v1 sprint-4-i18n-polish TASK-10
/sdlc:task v1 sprint-4-i18n-polish TASK-11
/sdlc:task v1 sprint-4-i18n-polish TASK-12
/sdlc:task v1 sprint-4-i18n-polish TASK-13
/sdlc:task v1 sprint-4-i18n-polish TASK-14
```

Chạy toàn bộ sprint (pre-flight → implement theo wave → test + QA gate):

```
/sdlc:execute v1 sprint-4-i18n-polish
```

## Waves (execute chạy song song trong cùng wave)
- Wave 1 (Foundation): TASK-01, TASK-02, TASK-03, TASK-04
- Wave 2 (Metadata + sitemap + callsite): TASK-05, TASK-06, TASK-07, TASK-08, TASK-09, TASK-10, TASK-11, TASK-12, TASK-13
- Wave 3 (Verify sweep + gate): TASK-14

## Ghi chú vận hành
- Verify build bằng `tsc --noEmit` + `next build` (eslint repo hỏng sẵn — KHÔNG dùng để gate).
- Wave 2 phụ thuộc Wave 1: các trang metadata (TASK-05..09) cần TASK-01 (helper) + TASK-02 (namespace);
  sitemap (TASK-10) cần TASK-01; callsite tiền (TASK-11/12) cần TASK-04; reservation (TASK-13) cần TASK-03.
- TASK-14 (sweep + hardcode scan + build gate) chạy CUỐI, sau khi mọi task Wave 2 xong.
- KHÔNG đụng admin (`formatCurrency`, `formatDateVN`, label) và KHÔNG sửa service/cache/routing/
  middleware sprint-1/2/3 — chỉ tiêu thụ API hiện có. Giữ nguyên giá trị tiền/ngày, URL en không đổi.
