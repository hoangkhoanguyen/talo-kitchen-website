-- =============================================================================
-- Talo Kitchen · i18n v1 · Entity translation tables + seed `en`  (GREEN schema)
-- =============================================================================
-- Chạy SAU khi đã clone prod -> prod_v2 (schema + toàn bộ data) bằng pg_dump/restore.
-- Chỉ tạo 3 bảng *_translations (ADDITIVE) + seed bản `en` từ cột gốc.
-- KHÔNG đụng cột gốc products/product_categories/product_addons.
-- Idempotent: chạy lại không tạo trùng (ON CONFLICT DO NOTHING).
--
-- CÁCH DÙNG (Supabase SQL editor hoặc psql, role đủ quyền DDL trong schema đích):
--   1. Đổi tên schema ở dòng SET dưới nếu green schema của bạn KHÔNG tên "prod_v2".
--   2. Chạy toàn bộ phần "PART 1" (trong 1 transaction).
--   3. Chạy phần "PART 2 — VERIFY" và ĐỌC kết quả (mọi dòng phải OK).
--
-- LƯU Ý: đây CHỈ là phần entity (sprint-3). Migration config JSON (sprint-2) chạy
-- riêng bằng Node:  DB_SCHEMA=prod_v2 npm run migrate:configs-i18n
-- =============================================================================

SET search_path TO prod_v2, public;   -- <<< ĐỔI "prod_v2" nếu green schema khác tên

-- ------------------------------------------------------------------ PART 1: DDL + SEED
BEGIN;

-- 1) DDL — 3 bảng translation (nguồn: drizzle 0001_flashy_morbius.sql, bỏ schema-qualify)
CREATE TABLE product_translations (
  "id"              serial PRIMARY KEY NOT NULL,
  "product_id"      integer NOT NULL,
  "locale"          varchar(10) NOT NULL,
  "title"           varchar(255),
  "description"     text,
  "sub_description" text,
  "allergen_info"   text,
  "created_at"      timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"      timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT product_translations_product_id_locale_unique UNIQUE ("product_id", "locale")
);

CREATE TABLE product_category_translations (
  "id"          serial PRIMARY KEY NOT NULL,
  "category_id" integer NOT NULL,
  "locale"      varchar(10) NOT NULL,
  "name"        varchar(255),
  "description" varchar(1024),
  "created_at"  timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"  timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT product_category_translations_category_id_locale_unique UNIQUE ("category_id", "locale")
);

CREATE TABLE product_addon_translations (
  "id"         serial PRIMARY KEY NOT NULL,
  "addon_id"   integer NOT NULL,
  "locale"     varchar(10) NOT NULL,
  "name"       varchar(255),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT product_addon_translations_addon_id_locale_unique UNIQUE ("addon_id", "locale")
);

-- FK + ON DELETE CASCADE (resolve theo search_path -> prod_v2.products, ...)
ALTER TABLE product_translations
  ADD CONSTRAINT product_translations_product_id_products_id_fk
  FOREIGN KEY ("product_id") REFERENCES products("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE product_category_translations
  ADD CONSTRAINT product_category_translations_category_id_product_categories_id_fk
  FOREIGN KEY ("category_id") REFERENCES product_categories("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE product_addon_translations
  ADD CONSTRAINT product_addon_translations_addon_id_product_addons_id_fk
  FOREIGN KEY ("addon_id") REFERENCES product_addons("id") ON DELETE cascade ON UPDATE no action;

-- 2) SEED bản `en` từ cột gốc (idempotent). English gốc trở thành bản `en`/fallback.
INSERT INTO product_translations (product_id, locale, title, description, sub_description, allergen_info)
SELECT id, 'en', title, description, sub_description, allergen_info
FROM products
ON CONFLICT (product_id, locale) DO NOTHING;

INSERT INTO product_category_translations (category_id, locale, name, description)
SELECT id, 'en', name, description
FROM product_categories
ON CONFLICT (category_id, locale) DO NOTHING;

INSERT INTO product_addon_translations (addon_id, locale, name)
SELECT id, 'en', name
FROM product_addons
ON CONFLICT (addon_id, locale) DO NOTHING;

COMMIT;

-- ------------------------------------------------------------------ PART 2: VERIFY
-- Chạy các SELECT dưới và đọc cột "check" — TẤT CẢ phải = 'OK'.

-- 2a. Count bản `en` phải khớp 1:1 số entity gốc
SELECT 'products'   AS entity,
       (SELECT count(*) FROM products)                                   AS base,
       (SELECT count(*) FROM product_translations WHERE locale='en')     AS en_rows,
       CASE WHEN (SELECT count(*) FROM products)
               = (SELECT count(*) FROM product_translations WHERE locale='en')
            THEN 'OK' ELSE 'MISMATCH' END AS check
UNION ALL
SELECT 'categories',
       (SELECT count(*) FROM product_categories),
       (SELECT count(*) FROM product_category_translations WHERE locale='en'),
       CASE WHEN (SELECT count(*) FROM product_categories)
               = (SELECT count(*) FROM product_category_translations WHERE locale='en')
            THEN 'OK' ELSE 'MISMATCH' END
UNION ALL
SELECT 'addons',
       (SELECT count(*) FROM product_addons),
       (SELECT count(*) FROM product_addon_translations WHERE locale='en'),
       CASE WHEN (SELECT count(*) FROM product_addons)
               = (SELECT count(*) FROM product_addon_translations WHERE locale='en')
            THEN 'OK' ELSE 'MISMATCH' END;

-- 2b. Nội dung `en` phải khớp cột gốc (không lệch 1 dòng nào)
SELECT 'product title/desc mismatch' AS check_name, count(*) AS bad_rows,
       CASE WHEN count(*)=0 THEN 'OK' ELSE 'FAIL' END AS check
FROM products p
JOIN product_translations t ON t.product_id = p.id AND t.locale='en'
WHERE p.title IS DISTINCT FROM t.title
   OR p.description IS DISTINCT FROM t.description
   OR p.sub_description IS DISTINCT FROM t.sub_description
   OR p.allergen_info IS DISTINCT FROM t.allergen_info
UNION ALL
SELECT 'category name/desc mismatch', count(*),
       CASE WHEN count(*)=0 THEN 'OK' ELSE 'FAIL' END
FROM product_categories c
JOIN product_category_translations t ON t.category_id = c.id AND t.locale='en'
WHERE c.name IS DISTINCT FROM t.name
   OR c.description IS DISTINCT FROM t.description
UNION ALL
SELECT 'addon name mismatch', count(*),
       CASE WHEN count(*)=0 THEN 'OK' ELSE 'FAIL' END
FROM product_addons a
JOIN product_addon_translations t ON t.addon_id = a.id AND t.locale='en'
WHERE a.name IS DISTINCT FROM t.name;

-- 2c. FK cascade tồn tại đúng 3 cái
SELECT 'fk cascade count' AS check_name, count(*) AS n,
       CASE WHEN count(*)=3 THEN 'OK' ELSE 'FAIL' END AS check
FROM information_schema.referential_constraints rc
JOIN information_schema.table_constraints tc
  ON tc.constraint_name = rc.constraint_name AND tc.table_schema = 'prod_v2'
WHERE rc.delete_rule = 'CASCADE'
  AND tc.table_name IN ('product_translations','product_category_translations','product_addon_translations');
