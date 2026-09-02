-- =============================================================================
-- Talo Kitchen · Auth fix · Bảng refresh_token_rotations (grace-window chống race)
-- =============================================================================
-- Cần cho fix "admin bị logout sớm" (commit 5e4b986). Code `rotateRefreshToken`
-- INSERT vào bảng này mỗi lần xoay token → THIẾU bảng = refresh hỏng trên prod.
--
-- ADDITIVE (chỉ thêm bảng), không đụng dữ liệu cũ.
-- Tên schema được GHI RÕ (prod_v2.) trong từng câu — KHÔNG dùng search_path,
-- vì Supabase SQL editor chạy từng câu riêng khiến `SET search_path` không dính.
--
-- CÁCH DÙNG: nếu schema live KHÔNG tên "prod_v2", find & replace "prod_v2" → tên đúng,
-- rồi chạy cả file trong Supabase SQL editor (role đủ quyền tạo bảng).
-- =============================================================================

-- Guard: dừng ngay nếu schema prod_v2 không tồn tại (tránh tạo nhầm chỗ).
DO $$
BEGIN
  IF to_regnamespace('prod_v2') IS NULL THEN
    RAISE EXCEPTION 'Schema "prod_v2" không tồn tại — kiểm lại tên schema live.';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS prod_v2.refresh_token_rotations (
  "id"                serial PRIMARY KEY NOT NULL,
  "user_id"           integer NOT NULL,
  "old_refresh_token" text NOT NULL,
  "refresh_token_id"  integer NOT NULL,
  "expires_at"        timestamp with time zone NOT NULL,
  "created_at"        timestamp with time zone DEFAULT now() NOT NULL
);

-- Index cho lookup grace-window (getRecordByPreviousToken tra theo old_refresh_token).
CREATE INDEX IF NOT EXISTS refresh_token_rotations_old_token_idx
  ON prod_v2.refresh_token_rotations ("old_refresh_token");

-- ------------------------------------------------------------------ VERIFY (phải OK)
SELECT 'refresh_token_rotations' AS table_name,
       CASE WHEN to_regclass('prod_v2.refresh_token_rotations') IS NOT NULL
            THEN 'OK' ELSE 'MISSING' END AS check;

-- ------------------------------------------------------------------ DỌN BẢNG TẠO NHẦM
-- Nếu lần chạy trước (bản search_path) đã lỡ tạo bảng ở schema khác, kiểm & xoá:
--   SELECT table_schema FROM information_schema.tables WHERE table_name='refresh_token_rotations';
--   -- nếu thấy ở 'public' (hoặc schema lạ) mà KHÔNG phải prod_v2:
--   DROP TABLE public.refresh_token_rotations;
