import { relations } from "drizzle-orm";
import {
  foreignKey,
  integer,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { dbSchema } from "../../schema";
import { products } from "./products";

export const productTranslations = dbSchema.table(
  "product_translations",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id").notNull(),
    locale: varchar("locale", { length: 10 }).notNull(),
    title: varchar("title", { length: 255 }),
    description: text("description"),
    subDescription: text("sub_description"),
    allergenInfo: text("allergen_info"),
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
    productFk: foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
    }).onDelete("cascade"),
    productLocaleUnique: unique().on(table.productId, table.locale),
  }),
);

export const productTranslationsRelations = relations(
  productTranslations,
  ({ one }) => ({
    product: one(products, {
      fields: [productTranslations.productId],
      references: [products.id],
    }),
  }),
);
