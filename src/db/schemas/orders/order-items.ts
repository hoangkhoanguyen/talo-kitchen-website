import { dbSchema } from "@/db/schema";
import { relations } from "drizzle-orm";
import {
  foreignKey,
  integer,
  real,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { orderItemAddons } from "./order-item-addons";
import { orders } from "./orders";
import { products } from "../products";

export const orderItems = dbSchema.table(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id").notNull(),
    productId: integer("product_id").notNull(),
    productName: varchar("product_name", {
      length: 255,
    }).notNull(),
    price: real("price").notNull(),
    quantity: integer("quantity").notNull(),
    totalPrice: real("total_price").notNull(), // quantity * price + total addons
    note: text("note").notNull().default(""),
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
    productIdFk: foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
    }),
    orderIdFk: foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
    }),
  }),
);

export const orderItemsRelations = relations(orderItems, ({ many, one }) => ({
  addons: many(orderItemAddons),
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
