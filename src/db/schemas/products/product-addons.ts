import {
  boolean,
  foreignKey,
  integer,
  real,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { dbSchema } from "../../schema";
import { relations } from "drizzle-orm";
import { products } from "./products";
import { productAddonTranslations } from "./product-addon-translations";

export const productAddons = dbSchema.table(
  "product_addons",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    price: real("price").notNull().default(0),
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
  },
  (table) => ({
    productFk: foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
    }),
  }),
);

export const productAddonRelations = relations(
  productAddons,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productAddons.productId],
      references: [products.id],
    }),
    translations: many(productAddonTranslations),
  }),
);
