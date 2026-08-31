import { relations } from "drizzle-orm";
import {
  foreignKey,
  integer,
  serial,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { dbSchema } from "../../schema";
import { productAddons } from "./product-addons";

export const productAddonTranslations = dbSchema.table(
  "product_addon_translations",
  {
    id: serial("id").primaryKey(),
    addonId: integer("addon_id").notNull(),
    locale: varchar("locale", { length: 10 }).notNull(),
    name: varchar("name", { length: 255 }),
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
    addonFk: foreignKey({
      columns: [table.addonId],
      foreignColumns: [productAddons.id],
    }).onDelete("cascade"),
    addonLocaleUnique: unique().on(table.addonId, table.locale),
  }),
);

export const productAddonTranslationsRelations = relations(
  productAddonTranslations,
  ({ one }) => ({
    addon: one(productAddons, {
      fields: [productAddonTranslations.addonId],
      references: [productAddons.id],
    }),
  }),
);
