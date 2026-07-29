import { NewConfigDB } from "@/db/schemas";
import { MetaValue } from "@/types/settings";
import { reservationInitValue, reservationMeta } from "./reservation";

export const reservationInitConfig: NewConfigDB = {
  key: "reservation",
  title: "Cấu hình đặt bàn",
  description: "Cấu hình các thông tin liên quan đến đặt bàn",
  config_type: "app",
  value: {
    reservation: reservationInitValue,
  },
};

export const reservationConfigMeta: MetaValue[] = [reservationMeta];
