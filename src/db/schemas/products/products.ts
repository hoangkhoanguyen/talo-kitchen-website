import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  real,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { dbSchema } from "../../schema";
import { productAddons } from "./product-addons";
import { productImages } from "./product-images";
import { productCategories } from "./product-categories";

export const products = dbSchema.table("products", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", {
    length: 255,
  })
    .notNull()
    .unique(),
  title: varchar("title", {
    length: 255,
  }).notNull(),
  priority: integer("priority").notNull().default(0),
  categoryId: integer("category_id").notNull(),
  allergenInfo: text("allergen_info"),
  subDescription: text("sub_description"),
  description: text("description"),
  price: real("price").notNull().default(0),
  relatedProductIds: jsonb("related_product_ids")
    .$type<number[]>()
    .notNull()
    .default([]),
  isActive: boolean("is_active").notNull().default(false),
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

export const productsRelations = relations(products, ({ many, one }) => ({
  images: many(productImages),
  addons: many(productAddons),
  category: one(productCategories, {
    fields: [products.categoryId],
    references: [productCategories.id],
  }),
}));
