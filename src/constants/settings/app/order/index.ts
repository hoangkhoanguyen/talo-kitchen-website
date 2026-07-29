import { NewConfigDB } from "@/db/schemas";
import { MetaValue } from "@/types/settings";
import { shippingInitValue, shippingMeta } from "./shipping";

export const orderInitConfig: NewConfigDB = {
  key: "order",
  title: "Cấu hình đơn hàng",
  description: "Cấu hình các thông tin liên quan đến đơn hàng",
  config_type: "app",
  value: {
    shipping: shippingInitValue,
  },
};

export const orderMeta: MetaValue[] = [shippingMeta];
