import { serial, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { dbSchema } from "../../schema";
import { relations } from "drizzle-orm";
import { refreshTokens } from "./refresh-tokens";

// User table schema
export const users = dbSchema.table("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  avatar: text("avatar"),
  role: varchar("role", { length: 50 }).notNull().default("user"), // admin, manager, user
  isActive: boolean("is_active").notNull().default(true),
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

export const usersRelations = relations(users, ({ many }) => ({
  refreshTokens: many(refreshTokens),
}));

export type UserDB = typeof users.$inferSelect;
export type NewUserDB = typeof users.$inferInsert;
