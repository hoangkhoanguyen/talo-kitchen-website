-- =============================================================================
-- Talo Kitchen · Giá theo khung giờ (Happy Hour)
-- =============================================================================
-- ADDITIVE (chỉ thêm bảng + cột nullable) → code cũ vẫn chạy, Instant Rollback an toàn.
-- Chạy TRƯỚC khi promote bản code mới.
-- Tên schema GHI RÕ (prod_v2.) trong từng câu. Nếu schema live khác tên:
-- find & replace "prod_v2" → tên đúng, rồi chạy cả file trong Supabase SQL editor.
-- =============================================================================

DO $$
BEGIN
  IF to_regnamespace('prod_v2') IS NULL THEN
    RAISE EXCEPTION 'Schema "prod_v2" không tồn tại — kiểm lại tên schema live.';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS prod_v2.price_programs (
  "id"         serial PRIMARY KEY NOT NULL,
  "name"       varchar(255) NOT NULL,
  "is_active"  boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS prod_v2.price_program_slots (
  "id"           serial PRIMARY KEY NOT NULL,
  "program_id"   integer NOT NULL REFERENCES prod_v2.price_programs("id") ON DELETE CASCADE,
  "days_of_week" integer[] NOT NULL,
  "start_minute" integer NOT NULL,
  "end_minute"   integer NOT NULL,
  "price"        real NOT NULL
);

CREATE TABLE IF NOT EXISTS prod_v2.price_program_products (
  "program_id" integer NOT NULL REFERENCES prod_v2.price_programs("id") ON DELETE CASCADE,
  "product_id" integer NOT NULL REFERENCES prod_v2.products("id") ON DELETE CASCADE,
  PRIMARY KEY ("program_id", "product_id")
);

CREATE INDEX IF NOT EXISTS price_program_slots_program_idx
  ON prod_v2.price_program_slots ("program_id");
CREATE INDEX IF NOT EXISTS price_program_products_product_idx
  ON prod_v2.price_program_products ("product_id");

ALTER TABLE prod_v2.order_items ADD COLUMN IF NOT EXISTS "original_price" real;
ALTER TABLE prod_v2.order_items ADD COLUMN IF NOT EXISTS "price_program_id" integer;
