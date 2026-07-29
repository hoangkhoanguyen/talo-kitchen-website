import { serial, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { dbSchema } from "../../schema";
import { relations } from "drizzle-orm";
import { products } from "./products";

export const productCategories = dbSchema.table("product_categories", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  isActive: boolean("is_active").notNull().default(false),
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
});

export const productCategoriesRelations = relations(
  productCategories,
  ({ many }) => ({
    products: many(products),
  }),
);
