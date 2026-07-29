import { MetaValue } from "@/types/settings";
import { homepageMeta, initialHomepageConfig } from "./homepage";
import { initialLayoutConfig, layoutMeta } from "./layout";
import { initialMenuPageConfig, menuPageMeta } from "./menu-page";
import {
  initialReservationPageConfig,
  reservationPageMeta,
} from "./reservation-page";

export const UIItems = [
  {
    key: "homepage",
    title: "Cấu hình trang chủ",
  },
  {
    key: "layout",
    title: "Cấu hình layout",
  },
  {
    key: "menu_page",
    title: "Cấu hình trang Menu",
  },
  {
    key: "reservation_page",
    title: "Cấu hình trang Đặt bàn",
  },
];

export const initUIConfigs = {
  homepage: initialHomepageConfig,
  layout: initialLayoutConfig,
  menu_page: initialMenuPageConfig,
  reservation_page: initialReservationPageConfig,
};

export const uiMeta: Record<string, MetaValue[]> = {
  homepage: homepageMeta,
  layout: layoutMeta,
  menu_page: menuPageMeta,
  reservation_page: reservationPageMeta,
};
