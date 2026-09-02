import { integer, serial, text, timestamp } from "drizzle-orm/pg-core";
import { dbSchema } from "../../schema";
import { relations } from "drizzle-orm";
import { refreshTokens } from "./refresh-tokens";

/**
 * Log ngắn hạn ghi lại mỗi lần 1 refresh token bị xoay (rotate).
 *
 * Mục đích: cho phép request refresh "thua" trong race condition (2 request
 * refresh xảy ra gần như đồng thời cùng dùng 1 refresh token cookie) vẫn
 * được coi là hợp lệ trong 1 khoảng grace window ngắn, thay vì bị coi là
 * TOKEN_NOT_FOUND -> logout oan. Xem `rotateRefreshToken` /
 * `getRecordByPreviousToken` trong `src/services/auth.ts`.
 */
export const refreshTokenRotations = dbSchema.table("refresh_token_rotations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  oldRefreshToken: text("old_refresh_token").notNull(),
  refreshTokenId: integer("refresh_token_id").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const refreshTokenRotationRelations = relations(
  refreshTokenRotations,
  ({ one }) => ({
    refreshToken: one(refreshTokens, {
      fields: [refreshTokenRotations.refreshTokenId],
      references: [refreshTokens.id],
    }),
  }),
);

export type RefreshTokenRotationDB =
  typeof refreshTokenRotations.$inferSelect;
export type NewRefreshTokenRotationDB =
  typeof refreshTokenRotations.$inferInsert;
