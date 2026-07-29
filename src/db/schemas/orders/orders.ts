import { dbSchema } from "@/db/schema";
import { relations } from "drizzle-orm";
import { uuid } from "drizzle-orm/pg-core";
import { real, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { orderItems } from "./order-items";
import { orderStatusHistory } from "./order-status-history";
// export const orderTypeEnum = pgEnum("order_type", ["delivery", "pickup"]);
// export const orderStatusEnum = pgEnum("status", [
//   "pending",
//   "processing",
//   "completed",
//   "cancelled",
// ]);

export const orders = dbSchema.table("orders", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").notNull().defaultRandom().unique(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  firstName: varchar("first_name", {
    length: 255,
  }).notNull(),
  lastName: varchar("last_name", {
    length: 255,
  }).notNull(),
  customerPhone: varchar("phone", {
    length: 20,
  }).notNull(),
  totalPrice: real("total_price").notNull(),
  note: text("note"),
  internalNote: text("internal_note").notNull().default(""),
  orderType: varchar("order_type", {
    length: 20,
  }).notNull(),
  orderTypeLabel: varchar("order_type_label", {
    length: 100,
  }),
  deliveryAddress: text("delivery_address").notNull().default(""),
  addressNote: text("address_note").notNull().default(""),
  status: varchar("status", {
    length: 20,
  })
    .notNull()
    .default("pending"),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  shippingFee: real("shipping_fee").notNull().default(0),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
  statusHistory: many(orderStatusHistory),
}));
