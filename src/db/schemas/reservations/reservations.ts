import { dbSchema } from "@/db/schema";
import { InferEnum, relations } from "drizzle-orm";
import {
  integer,
  serial,
  text,
  uuid,
  varchar,
  timestamp,
  pgEnum,
  time,
  date,
} from "drizzle-orm/pg-core";
import { reservationStatusHistory } from "./reservation-status-history";

export const reservationStatusEnum = pgEnum("status", [
  "scheduled", // Đã đặt thành công
  "confirmed", // Đã xác nhận lại
  "seated", // Đã nhận bàn
  "completed", // Hoàn thành
  "cancelled", // Đã hủy
  "no_show", // Không đến
]);

export const reservations = dbSchema.table("reservations", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").notNull().defaultRandom().unique(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  customerFullName: varchar("customer_full_name", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
  note: text("note").notNull().default(""),
  internalNote: text("internal_note").notNull().default(""),
  numberOfPeople: varchar("number_of_people", {
    length: 20,
  }).notNull(),
  arrivalTime: time("arrival_time").notNull(),
  arrivalDate: date("arrival_date").notNull(),
  status: reservationStatusEnum().default("scheduled").notNull(),
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

export const reservationsRelations = relations(reservations, ({ many }) => ({
  statusHistory: many(reservationStatusHistory),
}));

export type ReservationDB = typeof reservations.$inferSelect;
export type NewReservationDB = typeof reservations.$inferInsert;

export type ReservationStatus = InferEnum<typeof reservationStatusEnum>;
