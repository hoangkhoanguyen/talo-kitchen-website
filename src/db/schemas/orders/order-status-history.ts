import { dbSchema } from "@/db/schema";
import {
  foreignKey,
  integer,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { orders } from "./orders";
import { relations } from "drizzle-orm";

export const orderStatusHistory = dbSchema.table(
  "order_status_history",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id").notNull(),
    previousStatus: varchar("previous_status", { length: 50 }).notNull(),
    newStatus: varchar("new_status", { length: 50 }).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    orderIdFk: foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
    }),
  }),
);

export const orderStatusHistoryRelations = relations(
  orderStatusHistory,
  ({ one }) => ({
    order: one(orders, {
      fields: [orderStatusHistory.orderId],
      references: [orders.id],
    }),
  }),
);
