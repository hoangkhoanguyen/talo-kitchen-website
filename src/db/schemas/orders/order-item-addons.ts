import { dbSchema } from "@/db/schema";
import { relations } from "drizzle-orm";
import {
  foreignKey,
  integer,
  real,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { productAddons } from "../products";
import { orderItems } from "./order-items";

export const orderItemAddons = dbSchema.table(
  "order_item_addons",
  {
    id: serial("id").primaryKey(),
    orderItemId: integer("order_item_id").notNull(),
    addonId: integer("addon_id").notNull(),
    addonName: varchar("addon_name", {
      length: 255,
    }).notNull(),
    price: real("price").notNull(),
    quantity: integer("quantity").notNull(),
    totalPrice: real("total_price").notNull(), // quantity * price
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
    addonFK: foreignKey({
      columns: [table.addonId],
      foreignColumns: [productAddons.id],
    }),
    orderItemFK: foreignKey({
      columns: [table.orderItemId],
      foreignColumns: [orderItems.id],
    }),
  }),
);

export const orderItemAddonsRelations = relations(
  orderItemAddons,
  ({ one }) => ({
    addon: one(productAddons, {
      fields: [orderItemAddons.addonId],
      references: [productAddons.id],
    }),
    orderItem: one(orderItems, {
      fields: [orderItemAddons.orderItemId],
      references: [orderItems.id],
    }),
  }),
);
