import { boolean, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { dbSchema } from "../../schema";

export const customers = dbSchema.table("customers", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", {
    length: 255,
  }).notNull(),
  lastName: varchar("last_name", {
    length: 255,
  }).notNull(),
  phone: varchar("phone", {
    length: 20,
  }).notNull(),
  lastUsedAddress: text("last_used_address"),
  lastUsedOrderType: varchar("last_used_order_type", {
    length: 20,
  }),
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
});

export type CustomerDB = typeof customers.$inferSelect;
export type NewCustomerDB = typeof customers.$inferInsert;
export type UpdateCustomerDB = Partial<
  Omit<CustomerDB, "id" | "createdAt" | "phone">
>;
