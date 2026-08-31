# v1 — i18n đa ngôn ngữ (English + Tiếng Việt) cho web user

Mục tiêu version: Website phía USER hỗ trợ 2 ngôn ngữ — **English (mặc định, đang có)** + **Tiếng Việt (mới)**. Kiến trúc cho phép thêm ngôn ngữ thứ 3 sau này mà không đập lại. **KHÔNG dịch giao diện admin** (label admin giữ tiếng Việt hiện tại); admin chỉ được thêm khả năng *nhập nội dung theo từng ngôn ngữ*.

Tech stack (kế thừa): Next.js 16 (App Router, RSC), TypeScript, PostgreSQL + Drizzle ORM, thư viện i18n **next-intl**.

## Ràng buộc xuyên suốt version
- Không làm hỏng dữ liệu đang chạy: mọi thay đổi schema/JSON config phải có migration, dữ liệu English hiện tại giữ nguyên và trở thành bản `en`/fallback.
- `title`/`sub_title` (array hiệu ứng xoay chữ) KHÔNG phải i18n — không tái dụng cho ngôn ngữ.
- `slug`, `price`, `priority`, `isActive`, ảnh, số, boolean: KHÔNG dịch, dùng chung mọi ngôn ngữ.
- Cache user-facing phải kèm `locale` trong key/tag để không phục vụ nhầm ngôn ngữ.

---

## sprint-1-i18n-foundation
- **Trạng thái**: done
- **Mô tả**: Dựng nền tảng i18n. Cài next-intl, routing `[locale]` (`/en/...`, `/vi/...`, `en` mặc định), middleware phát hiện locale (path → cookie `NEXT_LOCALE` → `Accept-Language`), language switcher ở Header, và xử lý **Loại C** (chuỗi tĩnh hardcode trong JSX → `messages/en.json` + `messages/vi.json`).
- **Features**:
  - Cài + cấu hình next-intl cho App Router/RSC.
  - Bọc `app/(web)/` dưới `app/(web)/[locale]/`; `en` là default.
  - Middleware detect + redirect về path có locale; giữ locale khi refresh.
  - Language switcher (EN/VI) trên Header.
  - Trích toàn bộ chuỗi tĩnh user-facing ra `messages/en.json` + `messages/vi.json`, thay bằng hàm dịch.
  - `<html lang>` set đúng theo locale.
- **Phụ thuộc**: không.

## sprint-2-config-i18n
- **Trạng thái**: done
- **Mô tả**: Loại B — UI config động trong bảng `configs` (`config_type='ui'`). Thêm cờ `localized` vào metadata field, migrate JSON config, sửa MỘT renderer field form admin, service resolve theo locale, cache theo locale.
- **Features**:
  - Thêm `localized?: boolean` vào `FieldType` (chỉ `text`/`textarea`).
  - Đổi giá trị text localized: `string` → `{ en: string; vi: string }`; cập nhật `src/types/configs.ts`.
  - Migration JSON: mỗi field localized trong mọi config `ui`: `"abc"` → `{ en: "abc", vi: "" }`.
  - Đánh dấu `localized: true` cho các field text/textarea là nội dung hiển thị thật (hero, our_story, gallery/reviews/contact text, menu_page labels, seo title/description…). KHÔNG đánh dấu ảnh/boolean/số.
  - Sửa 1 renderer field settings → render nhóm ô nhập theo từng locale (mọi trang settings tự áp dụng).
  - Service resolve config theo locale (fallback `en`) TRƯỚC khi trả cho component.
  - Cache config theo locale.
  - Badge "chưa dịch" cho field thiếu bản vi (+ tuỳ chọn nút "Copy từ English").
- **Phụ thuộc**: sprint-1-i18n-foundation.

## sprint-3-entity-i18n
- **Trạng thái**: done
- **Mô tả**: Loại A — Entity trong DB (products, categories, addons). Tạo bảng `*_translations`, migration seed `en`, sửa service theo locale + fallback, thêm tab ngôn ngữ ở form sản phẩm/danh mục/addon trong admin.
- **Features**:
  - Bảng `product_translations`, `product_category_translations`, `product_addon_translations`; unique `(entity_id, locale)`, FK + ON DELETE CASCADE.
  - Cột gốc trên bảng chính = bản English/fallback.
  - Migration seed bản `en` từ dữ liệu cột gốc hiện tại.
  - Sửa `src/services/products.ts` + `src/services/cached/products.ts` nhận `locale`, JOIN translation, fallback `en`; cache theo locale.
  - Dải tab `[Tiếng Anh] [Tiếng Việt]` ở đầu form sản phẩm/danh mục/addon, bọc quanh input text hiện có; field không dịch (price/slug/ảnh) hiển thị chung.
  - Badge "chưa dịch" cho entity thiếu bản vi.
- **Phụ thuộc**: sprint-1-i18n-foundation.

## sprint-4-i18n-polish
- **Trạng thái**: done
- **Mô tả**: Hoàn thiện & QA. SEO hreflang + `alternates.languages`, `generateMetadata` theo locale, format tiền/ngày theo locale (moment → Intl/locale), rà soát fallback toàn bộ, quét chuỗi English còn sót, QA toàn bộ trang user + admin.
- **Features**:
  - `generateMetadata` đọc theo locale + `alternates.languages` (hreflang en/vi), `<html lang>` đúng.
  - Format tiền/ngày theo locale (xử lý code đang dùng `moment`).
  - Rà fallback English mọi loại nội dung, không vỡ layout khi thiếu bản dịch.
  - Quét & loại bỏ chuỗi English hardcode còn sót phía user.
  - QA acceptance toàn bộ: đổi ngôn ngữ, URL phản ánh locale, refresh giữ ngôn ngữ; admin vẫn tiếng Việt, nhập được cả en/vi.
- **Phụ thuộc**: sprint-2-config-i18n, sprint-3-entity-i18n.
