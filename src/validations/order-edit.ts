import z from "zod";
import { customerPhoneSchema } from "./checkout";
import {
  MAX_ADDON_QUANTITY,
  MAX_ITEM_NOTE_LENGTH,
  MAX_ITEM_QUANTITY,
} from "@/lib/order-edit";

const id = z.number().int().positive();
const itemQuantity = z.number().int().min(1).max(MAX_ITEM_QUANTITY);

// Chỉ nhận id + số lượng từ client; giá luôn lấy lại từ DB ở server.
export const addOrderItemSchema = z.object({
  orderId: id,
  productId: id,
  quantity: itemQuantity,
  note: z.string().max(MAX_ITEM_NOTE_LENGTH).default(""),
  addons: z
    .array(
      z.object({
        addonId: id,
        quantity: z.number().int().min(1).max(MAX_ADDON_QUANTITY),
      }),
    )
    .max(50)
    .refine((list) => new Set(list.map((a) => a.addonId)).size === list.length, {
      message: "Duplicate addons",
    }),
});

export const updateOrderItemQuantitySchema = z.object({
  orderId: id,
  itemId: id,
  quantity: itemQuantity,
});

export const removeOrderItemSchema = z.object({
  orderId: id,
  itemId: id,
});

export const updateOrderCustomerPhoneSchema = z.object({
  orderId: id,
  customerPhone: customerPhoneSchema,
});
