import { dbSchema } from "@/db/schema";
import {
  foreignKey,
  integer,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { reservations } from "./reservations";
import { relations } from "drizzle-orm";

export const reservationStatusHistory = dbSchema.table(
  "reservation_status_history",
  {
    id: serial("id").primaryKey(),
    reservationId: integer("reservation_id").notNull(),
    previousStatus: varchar("previous_status", { length: 50 }).notNull(),
    newStatus: varchar("new_status", { length: 50 }).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    reservationIdFk: foreignKey({
      columns: [table.reservationId],
      foreignColumns: [reservations.id],
    }),
  }),
);

export const reservationStatusHistoryRelations = relations(
  reservationStatusHistory,
  ({ one }) => ({
    reservation: one(reservations, {
      fields: [reservationStatusHistory.reservationId],
      references: [reservations.id],
    }),
  }),
);
