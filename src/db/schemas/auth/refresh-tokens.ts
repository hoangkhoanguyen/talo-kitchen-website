import { boolean, integer, serial, text, timestamp } from "drizzle-orm/pg-core";
import { dbSchema } from "../../schema";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const refreshTokens = dbSchema.table("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  refreshToken: text("refresh_token").notNull(),
  isValid: boolean("is_valid").notNull().default(true),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

export const refreshTokenRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export type RefreshTokenDB = typeof refreshTokens.$inferSelect;
export type NewRefreshTokenDB = typeof refreshTokens.$inferInsert;
