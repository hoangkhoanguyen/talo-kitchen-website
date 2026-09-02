import { relations } from "drizzle-orm";
import {
  foreignKey,
  integer,
  serial,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { dbSchema } from "../../schema";
import { productCategories } from "./product-categories";

export const productCategoryTranslations = dbSchema.table(
  "product_category_translations",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id").notNull(),
    locale: varchar("locale", { length: 10 }).notNull(),
    name: varchar("name", { length: 255 }),
    description: varchar("description", { length: 1024 }),
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
    categoryFk: foreignKey({
      columns: [table.categoryId],
      foreignColumns: [productCategories.id],
    }).onDelete("cascade"),
    categoryLocaleUnique: unique().on(table.categoryId, table.locale),
  }),
);

export const productCategoryTranslationsRelations = relations(
  productCategoryTranslations,
  ({ one }) => ({
    category: one(productCategories, {
      fields: [productCategoryTranslations.categoryId],
      references: [productCategories.id],
    }),
  }),
);
