# Sprint-11 — Cutover Checklist (go-live)

App Payload mới (`../talo-kitchen-payload`) đã build & chạy được với data production đã migrate vào schema `dev`. Sprint này là **đưa lên production** — phần lớn là thao tác/ quyết định của bạn (deployment, DNS, infra), tôi không tự thực hiện các bước outward-facing/không đảo được.

## A. Quyết định cần chốt (BLOCKING — chỉ bạn)
- [ ] **Deployment target**: Vercel / VPS(Node) / Docker. Payload cần Node server bền (không edge-only). Ảnh hưởng cách build & env.
- [ ] **Production DB**: hiện đang trỏ Supabase schema `dev` (dev). Production sẽ dùng schema/DB nào? (khuyến nghị 1 schema `public` hoặc DB riêng cho prod; đổi `schemaName` + `DATABASE_URL`, dùng port 5432 cho DDL).
- [ ] **R2 env** (đang lệch): `.env` `R2_BUCKET_NAME=linh-dev` vs `R2_PUBLIC_URL=https://assets.talokitchenhg.com` fronts bucket khác → ảnh 404. Chốt cặp bucket↔domain đúng cho prod (bucket mà `assets.talokitchenhg.com` phục vụ), rồi cập nhật `.env`.

## B. Tiền production
- [ ] Tạo DB/schema production, set `DATABASE_URL` (5432 cho migration DDL), `PAYLOAD_SECRET` mới (mạnh), `R2_*` đúng, `SERPAPI_API_KEY`.
- [ ] Chuyển Payload từ dev "push" sang **migrations chính thức**: `payload migrate:create` để sinh file migration, commit; production chạy `payload migrate` (không dùng auto-push trên prod).
- [ ] Chạy migration data `scripts/migrate/index.ts` trỏ nguồn = production cũ (schema `prod` thật) → đích prod. (Script hiện đọc `dev_for_migrate`; đổi schema nguồn khi chạy thật.)
- [ ] **Reset mật khẩu 4 staff users**: đang là tạm `ChangeMe-<legacyId>-2026`. Gửi reset hoặc đặt mật khẩu thật qua admin.

## C. Cutover (production — bạn thao tác)
- [ ] Deploy app mới lên target đã chọn; smoke test /admin login + vài trang web.
- [ ] **Delta migration**: migrate các order/reservation phát sinh giữa lần migrate đầy đủ và cutover (script idempotent theo legacyId, chạy lại an toàn).
- [ ] Verify ảnh R2 hiển thị (sau khi fix env ở A).
- [ ] Đổi DNS/traffic từ app cũ → app mới. **Đây là bước không đảo — cần bạn xác nhận & thực hiện.**
- [ ] Theo dõi lỗi sau cutover; giữ app cũ như rollback tới khi ổn định.

## D. Dọn dẹp (sau khi ổn định)
- [ ] Gỡ scripts smoke-sprint*/migrate nếu không cần (hoặc chuyển vào tests/).
- [ ] Repo cũ `talo-kitchen` giữ read-only làm reference lịch sử (đã chốt).
- [ ] Xoá bucket/dữ liệu dev thừa nếu có.

## Trạng thái tự động đã chuẩn bị
- App build OK (`next build`), 12 routes, admin RBAC, data migrated (dev), revalidation hooks, SEO.
- Migration scripts idempotent sẵn sàng tái dùng cho delta + prod (chỉ đổi schema nguồn/đích + connection).
- Các known-issue đã ghi: R2 env lệch, temp passwords, numberOfPeople đã fix (text).
