import { NewConfigDB } from "@/db/schemas";
import { footerInitialValue, footerMeta } from "./footer";
import { headerInitValue, headerMeta } from "./header";
import { MetaValue } from "@/types/settings";
import { floatingActionMeta } from "./floating-actions";

export const layoutMeta: MetaValue[] = [
  headerMeta,
  footerMeta,
  floatingActionMeta,
];

export const initialLayoutConfig: NewConfigDB = {
  key: "layout",
  title: "Cấu hình layout",
  config_type: "ui",
  description: "Cấu hình các phần giao diện của layout (Header, Footer)",
  value: {
    header: headerInitValue,
    footer: footerInitialValue,
    floating_actions: {
      showScrollToTopButton: true,
      whatsAppCalling: {
        phoneNumber: "84898082138",
        showButton: true,
      },
    },
  },
};
