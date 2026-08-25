# Migration Inventory & Mapping Checklist

Bản kiểm kê toàn bộ logic app cũ (`talo-kitchen`, schema Postgres `prod`) → Payload tương ứng. **Convert xong mẩu nào tick `[x]`.** Đây là thước đo "convert cho hết".

Legend: ☐ chưa làm · ✅ xong · ⚠️ có điểm cần xử lý (xem cột ghi chú)

---

## Tầng 1 — DATA MODEL (Drizzle tables → Payload collections/fields)

### product_categories → Collection `categories`
- [ ] id serial → Payload id (+ `legacyId` number để trace)
- [ ] slug varchar(255) notNull **unique** → text, required, unique, validate no-whitespace
- [ ] name varchar(255) notNull → text required
- [ ] isActive boolean default false → checkbox default false
- [ ] description varchar(1024) → textarea
- [ ] createdAt/updatedAt → Payload timestamps (tự có)

### products → Collection `products`
- [ ] id serial → id + `legacyId`
- [ ] slug varchar(255) notNull unique → text required unique, validate no-whitespace
- [ ] title varchar(255) notNull → text required
- [ ] priority integer default 0 → number (dùng cho sort)
- [ ] categoryId integer notNull → **relationship** → `categories` (required)
- [ ] allergenInfo text → textarea
- [ ] subDescription text → textarea
- [ ] description text → textarea (⚠️ plain text, KHÔNG richtext)
- [ ] price real default 0 → number (float) required
- [ ] relatedProductIds jsonb number[] → **relationship hasMany** → `products` (⚠️ không phải join table, map array id)
- [ ] isActive boolean default false → checkbox
- [ ] createdAt/updatedAt → auto

### product_addons → array/join trên `products` HOẶC collection `product-addons`
- [ ] id serial → id/legacyId
- [ ] productId FK → relationship/parent
- [ ] name varchar(255) notNull → text required
- [ ] sortOrder integer default 0 → number (⚠️ app cũ recompute = index+1 khi save)
- [ ] price real default 0 → number
- [ ] isActive boolean default true → checkbox
- [ ] (quyết định ở feature 2: array field trong Products vs collection riêng)

### product_images → array `images` trên `products` + Payload Media
- [ ] url varchar(512) → upload → `media` (⚠️ app cũ chỉ lưu URL string, không track DB)
- [ ] altText varchar(255) → text
- [ ] productId → parent product
- [ ] isPrimary boolean → checkbox (đúng 1 primary)
- [ ] sortOrder integer → number

### customers → Collection `customers` (⚠️ NO auth)
- [ ] id → id/legacyId
- [ ] firstName/lastName varchar(255) notNull → text required
- [ ] phone varchar(20) notNull → text (⚠️ natural key lookup, thêm index; schema cũ không đánh unique)
- [ ] lastUsedAddress text → textarea
- [ ] lastUsedOrderType varchar(20) → text/select
- [ ] isActive boolean default true → checkbox

### users → Collection `users` (⚠️ AUTH-enabled, thay JWT cũ)
- [ ] id → id/legacyId
- [ ] username varchar(100) unique → text unique (Payload auth mặc định dùng email; thêm username field)
- [ ] email varchar(255) unique → auth email
- [ ] password → **Payload tự quản** (⚠️ bcrypt cũ có thể không import trực tiếp → cân nhắc force reset, xem feature 3/8)
- [ ] firstName/lastName/phone/avatar → text/upload
- [ ] role varchar(50) default 'user' (admin/manager/user) → select (⚠️ dùng cho access control; sửa bug ép admin)
- [ ] isActive boolean → checkbox

### refresh_tokens → ❌ BỎ (Payload tự quản session/JWT)
- [ ] Xác nhận không port; chấp nhận mất revoke server-side

### reservations → Collection `reservations`
- [ ] id/uuid/legacyId
- [ ] code varchar(50) unique → text unique (⚠️ sinh 'LFW'+random KHÔNG unique → fix)
- [ ] customerFullName/customerPhone → text required
- [ ] note text default '' / internalNote text default '' → textarea
- [ ] numberOfPeople varchar(20) → ⚠️ cũ lưu string, cân nhắc number
- [ ] arrivalTime time → text/time field
- [ ] arrivalDate date → date field
- [ ] status enum(scheduled/confirmed/seated/completed/cancelled/no_show) default scheduled → select

### reservation_status_history → array/collection lịch sử
- [ ] reservationId FK, previousStatus, newStatus, createdAt → ghi bằng hook

### orders → Collection `orders`
- [ ] id/uuid/legacyId
- [ ] code varchar(20) unique → text unique (⚠️ random không unique → fix)
- [ ] firstName/lastName/phone → text
- [ ] totalPrice real → number
- [ ] note / internalNote → textarea
- [ ] orderType varchar(20) (delivery/pickup) → select (⚠️ enum cũ bị comment)
- [ ] orderTypeLabel varchar(100) → text
- [ ] deliveryAddress/addressNote text → textarea
- [ ] status default 'pending' (pending/processing/completed/cancelled) → select
- [ ] paymentMethod varchar(50) ('cash') → select
- [ ] shippingFee real default 0 → number
- [ ] createdAt/updatedAt → ⚠️ updatedAt cũ thiếu timezone → chuẩn hoá

### order_items → array/collection
- [ ] orderId/productId FK → relationship
- [ ] productName/price snapshot → text/number (⚠️ snapshot tại thời điểm đặt, KHÔNG join live)
- [ ] quantity/totalPrice/note

### order_item_addons → array/collection
- [ ] orderItemId/addonId FK → relationship
- [ ] addonName/price snapshot, quantity, totalPrice

### order_status_history → array/collection lịch sử (ghi bằng hook)

### configs (composite PK key+config_type) → Payload **Globals** (feature 6)
- [ ] app:`order` (shipping.methods[], shipping.rules[], closed_mode) → Global `order-settings`
- [ ] app:`reservation` (closed_mode + settings) → Global `reservation-settings`
- [ ] ui:`homepage` (hero/gallery/contact/our-story/reviews/seo/why-choose-us) → Global `homepage`
- [ ] ui:`menu_page` (hero/food-categories/introduction/new-product/seo/why-choose-us) → Global `menu-page`
- [ ] ui:`reservation_page` (hero/booking/seo) → Global `reservation-page`
- [ ] ui:`layout` (header/footer/floating-actions) → Global `layout` (✅ key confirmed trong DB = `layout`)
- [ ] ⚠️ Bỏ toàn bộ meta-schema `src/constants/settings/**` (Payload field thay thế)

---

## Tầng 2 — BUSINESS RULES (services/actions → Payload hooks/endpoints/access)

- [ ] `createOrder` transaction (services/orders.ts): upsert customer theo phone → **hook beforeChange/afterChange** hoặc custom endpoint
- [ ] `validateOrderData` (⚠️ CRITICAL — chống sửa giá): re-fetch product/addon từ DB, reject nếu thiếu/inactive/lệch giá → **beforeChange hook trên orders** (KHÔNG để client-side)
- [ ] Snapshot product image/slug vào order item lúc tạo → hook
- [ ] `updateOrderStatus` / `updateReservationStatus`: ghi status_history khi status đổi → **afterChange hook** (so previousDoc vs doc)
- [ ] `canEditOrderNote` / `canEditReservationNote`: chặn sửa internalNote khi status cancelled/completed → **beforeChange hook / access**
- [ ] Sinh order code / reservation code → hook (⚠️ đảm bảo unique: retry hoặc counter)
- [ ] `updateProductById` diff-based update (chỉ update field đổi) → Payload tự lo; giữ logic sortOrder = index+1 nếu cần
- [ ] Tag-based revalidation sau khi write (revalidateProductUpdate/ImageChange/ConfigUpdate/All) → **afterChange/afterDelete hook** gọi `revalidateTag`/`revalidatePath`

---

## Tầng 3 — VALIDATION (zod → Payload field validate)

- [ ] checkout.ts: phone 10-20, name required, paymentMethod ['cash'], shippingMethod door2door/pickup, deliveryAddress≥5 khi door2door
- [ ] reservation.ts: arrivalTime/Date required, numberOfPeople required, fullName 2-255, phone 7-20, note ≤1000
- [ ] product.ts: category (name/slug≤255, slug no-whitespace, desc≤1000), addon (name≤255, price number, isActive), image (url required), product (title/slug/categoryId required, price ≥0, priority number)
- [ ] auth.ts: login, register (username 3-50 alnum_, email, password 6-255, confirm match, secretCode gate), changePassword → phần lớn Payload auth lo; giữ secretCode gate nếu vẫn muốn giới hạn self-register
- [ ] settings.ts primitives → thay bằng field type Payload

---

## Tầng 4 — API SURFACE

### Admin API (`(admin)/admin/api/**`, đang wrap withAuth) → Payload REST/Local API + admin UI
- [ ] auth/refresh-token → Payload auth (tự có)
- [ ] categories (list/paginate/search/filter isActive) + [id] update → Payload REST tự sinh
- [ ] images GET (list toàn bucket) + POST (upload) → Payload Media collection
- [ ] orders GET (paginate/filter search/date/status[]/order_type[]) → Payload REST + admin list filters
- [ ] products GET (paginate/search) + products/all (light list) → Payload REST
- [ ] reservations GET (paginate/filter; ⚠️ filter reservation_type là dead param) → Payload REST

### Web API (`(web)/api/**`, no auth) → Payload Local API trong RSC hoặc REST
- [ ] products/ids?ids= (bulk theo id, dùng cho cart) → Local API `payload.find`
- [ ] products/quick/[id] (quick-view) → Local API

### Global
- [ ] /api/revalidate-all (⚠️ no auth) → thay bằng hook revalidation; thêm auth nếu giữ

---

## Tầng 5 — UI & FLOW (frontend port, feature 9)

- [ ] `/` home: hero/gallery/contact/our-story/reviews/why-choose-us từ Global homepage + Google reviews (gg-map-reviews.ts, SERPAPI_API_KEY)
- [ ] `/menu` + `/menu/[category]`: category tabs, product grid ('all' = virtual slug)
- [ ] `/dish` + `/dish/[slug]`: gallery, description/allergen/addons, related products, SEO metadata + OG + canonical
- [ ] `/cart`: zustand cart store {productId,quantity,selectedAddonIds}[]; useGetCartProducts hydrate qua Payload
- [ ] `/checkout`: đọc Global order-settings (shipping methods/rules/default), checkout store, useCreateOrder → validate giá server-side
- [ ] `/reservation`: booking form (react-datepicker custom css) → create reservation
- [ ] Shared: header + mobile-menu store, quick-cart slide-over, ui primitives (button/form/loading/modal)
- [ ] Cache: createDynamicCachedFunction + tags (constants/cache/tags.ts) → giữ revalidateTag behavior với Payload hooks
- [ ] SEO/branding: 'TALO Kitchen & Lounge', locale en_US OG, canonical, APP_ICONS

---

## Cross-cutting

- [ ] Auth: bcrypt+jose+refresh_tokens → Payload built-in auth (users), cookies, RBAC theo role
- [ ] Media: R2 raw key string → Payload Media + storage-s3
- [ ] Env: R2_* , DATABASE_URL(mới), SERPAPI_API_KEY, REGISTER_SECRET_CODE(nếu giữ), PAYLOAD_SECRET(mới)
- [ ] next.config remote image hosts: *.r2.dev, assets.talokitchenhg.com (+ 2 domain legacy Ltelle — cân nhắc bỏ)
- [ ] Data migration old→new với legacyId map (feature 8)
