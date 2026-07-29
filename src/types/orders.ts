import { orderItemAddons, orderItems, orders } from "@/db/schemas/orders";
import { EShippingMethod } from "./app-configs";

export enum PaymentMethod {
  cash_on_delivery = "cash_on_delivery",
}

export enum OrderStatus {
  pending = "pending",
  processing = "processing",
  completed = "completed",
  cancelled = "cancelled",
}

export interface AdminOrderTable {
  id: number;
  code: string;
  customerName: string;
  customerPhone: string;
  totalPrice: number;
  note: string | null;
  createdAt: string;
  orderType: EShippingMethod;
  orderTypeLabel: string;
  deliveryAddress: string | null;
  status: OrderStatus;
}

export interface AdminOrderAddon {
  id: number;
  addonId: number;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface AdminOrderItem {
  id: number;
  productId: number;
  productName: string;
  image: string | null;
  price: number;
  quantity: number;
  addons: AdminOrderAddon[];
  totalPrice: number; // unit * quan + total addons
  note: string | null;
}

export interface AdminOrderDetails extends AdminOrderTable {
  internalNote: string | null;
  orderItems: AdminOrderItem[];
  addressNote: string | null;
  paymentMethod: string;
  shippingFee: number;
}

export type OrderDB = typeof orders.$inferSelect;
export type NewOrderDB = typeof orders.$inferInsert;

export type OrderItemDB = typeof orderItems.$inferSelect;
export type NewOrderItemDB = typeof orderItems.$inferInsert;

export type OrderItemAddonDB = typeof orderItemAddons.$inferSelect;
export type NewOrderItemAddonDB = typeof orderItemAddons.$inferInsert;

export type AdminOrderTableApi = OrderDB;
