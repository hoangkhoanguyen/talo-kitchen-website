import { MetaValue } from "@/types/settings";
import { NewConfigDB } from "@/db/schemas";
import { orderInitConfig, orderMeta } from "./order";
import { reservationConfigMeta, reservationInitConfig } from "./reservation";

export const APPItems = [
  {
    key: "order",
    title: "Cấu hình đặt hàng",
  },
  {
    key: "reservation",
    title: "Cấu hình đặt bàn",
  },
];

export const initAppConfigs: Record<string, NewConfigDB> = {
  order: orderInitConfig,
  reservation: reservationInitConfig,
};

export const appMeta: Record<string, MetaValue[]> = {
  order: orderMeta,
  reservation: reservationConfigMeta,
};
