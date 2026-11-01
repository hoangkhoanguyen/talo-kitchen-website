import { relations } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  integer,
  primaryKey,
  real,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { dbSchema } from "../../schema";
import { products } from "./products";

/**
 * Chương trình giá theo khung giờ (Happy Hour). Khách tự cấu hình trong admin.
 * Giá được TÍNH lúc request (src/lib/pricing.ts), không đổi `products.price`.
 */
export const pricePrograms = dbSchema.table("price_programs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Khung giờ của chương trình. Giờ VN, phút trong ngày, khoảng [start, end). */
export const priceProgramSlots = dbSchema.table(
  "price_program_slots",
  {
    id: serial("id").primaryKey(),
    programId: integer("program_id").notNull(),
    // 0 = CN, 1 = T2 … 6 = T7
    daysOfWeek: integer("days_of_week").array().notNull(),
    startMinute: integer("start_minute").notNull(),
    endMinute: integer("end_minute").notNull(),
    price: real("price").notNull(),
  },
  (table) => ({
    programFk: foreignKey({
      columns: [table.programId],
      foreignColumns: [pricePrograms.id],
    }).onDelete("cascade"),
  }),
);

export const priceProgramProducts = dbSchema.table(
  "price_program_products",
  {
    programId: integer("program_id").notNull(),
    productId: integer("product_id").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.programId, table.productId] }),
    programFk: foreignKey({
      columns: [table.programId],
      foreignColumns: [pricePrograms.id],
    }).onDelete("cascade"),
    productFk: foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
    }).onDelete("cascade"),
  }),
);

export const priceProgramsRelations = relations(pricePrograms, ({ many }) => ({
  slots: many(priceProgramSlots),
  products: many(priceProgramProducts),
}));

export const priceProgramSlotsRelations = relations(
  priceProgramSlots,
  ({ one }) => ({
    program: one(pricePrograms, {
      fields: [priceProgramSlots.programId],
      references: [pricePrograms.id],
    }),
  }),
);

export const priceProgramProductsRelations = relations(
  priceProgramProducts,
  ({ one }) => ({
    program: one(pricePrograms, {
      fields: [priceProgramProducts.programId],
      references: [pricePrograms.id],
    }),
    product: one(products, {
      fields: [priceProgramProducts.productId],
      references: [products.id],
    }),
  }),
);
