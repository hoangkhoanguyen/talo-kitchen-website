-- =============================================================================
-- Talo Kitchen · Auth fix · Bảng refresh_token_rotations (grace-window chống race)
-- =============================================================================
-- Cần cho fix "admin bị logout sớm" (commit 5e4b986). Code `rotateRefreshToken`
-- INSERT vào bảng này mỗi lần xoay token → THIẾU bảng = refresh hỏng trên prod.
--
-- Chạy trên schema production ĐANG LIVE (hiện là prod_v2) TRƯỚC/khi deploy branch
-- fix/login-brand-and-auth-logout. ADDITIVE (chỉ thêm bảng), không đụng dữ liệu cũ.
--
-- CÁCH DÙNG (Supabase SQL editor / psql, role đủ quyền tạo bảng):
--   Đổi "prod_v2" ở dòng SET nếu schema live khác tên, rồi chạy cả file.
-- =============================================================================

SET search_path TO prod_v2, public;   -- <<< ĐỔI nếu schema live khác tên

CREATE TABLE IF NOT EXISTS refresh_token_rotations (
  "id"                serial PRIMARY KEY NOT NULL,
  "user_id"           integer NOT NULL,
  "old_refresh_token" text NOT NULL,
  "refresh_token_id"  integer NOT NULL,
  "expires_at"        timestamp with time zone NOT NULL,
  "created_at"        timestamp with time zone DEFAULT now() NOT NULL
);

-- Index cho lookup grace-window (getRecordByPreviousToken tra theo old_refresh_token).
CREATE INDEX IF NOT EXISTS refresh_token_rotations_old_token_idx
  ON refresh_token_rotations ("old_refresh_token");

-- ------------------------------------------------------------------ VERIFY
-- Phải trả 1 dòng, check = 'OK'
SELECT 'refresh_token_rotations' AS table_name,
       CASE WHEN to_regclass('prod_v2.refresh_token_rotations') IS NOT NULL
            THEN 'OK' ELSE 'MISSING' END AS check;
