import {
  integer,
  varchar,
  boolean,
  serial,
  timestamp,
} from "drizzle-orm/pg-core";
import { dbSchema } from "../../schema";
import { relations } from "drizzle-orm";
import { products } from "./products";

export const productImages = dbSchema.table("product_images", {
  id: serial("id").primaryKey(),
  url: varchar("url", { length: 512 }).notNull(),
  altText: varchar("alt_text", { length: 255 }).notNull(),
  productId: integer("product_id").notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
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

export const productImageRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));
