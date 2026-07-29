import { dbSchema } from "@/db/schema";
import { Config } from "@/types/configs";
import {
  jsonb,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const configs = dbSchema.table(
  "configs",
  {
    key: varchar("key", { length: 255 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    config_type: varchar("config_type", { length: 20 }).notNull(), // 'app' | 'ui'
    value: jsonb("value").$type<Config>().notNull(),
    description: text("description"),
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
  },
  (table) => ({
    pk: primaryKey({
      name: "pk_configs",
      columns: [table.key, table.config_type],
    }),
  }),
);

export type ConfigDB = typeof configs.$inferSelect;
export type NewConfigDB = typeof configs.$inferInsert;
export type UpdateConfigDB = Partial<
  Omit<ConfigDB, "key" | "createdAt" | "updatedAt">
>;
