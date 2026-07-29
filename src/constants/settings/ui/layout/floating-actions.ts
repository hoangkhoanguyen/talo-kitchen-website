import { ConfigValue } from "@/types/configs";
import { MetaValue } from "@/types/settings";

export const floatingActionInitValue: ConfigValue = {
  showScrollToTopButton: true,
  whatsAppCalling: {
    phoneNumber: "84898082138",
    showButton: true,
  },
};

export const floatingActionMeta: MetaValue = {
  title: "Floating Actions",
  description: "Cấu hình các hành động nổi trên giao diện",
  key: "floating_actions",
  fields: [
    {
      key: "showScrollToTopButton",
      label: "Hiển thị nút cuộn lên đầu trang",
      type: "boolean",
      description: "Bật/tắt hiển thị nút cuộn lên đầu trang",
      isRequired: false,
    },
    {
      key: "whatsAppCalling",
      label: "Gọi WhatsApp",
      type: "object",
      description: "Cấu hình nút gọi WhatsApp",
      needBox: true,
      isRequired: false,
      fields: [
        {
          key: "phoneNumber",
          label: "Số điện thoại WhatsApp",
          type: "text",
          description:
            "Nhập số điện thoại WhatsApp để liên hệ (bao gồm mã quốc gia, ví dụ: 84898082138)",
          isRequired: true,
          placeholder: "Nhập số điện thoại WhatsApp",
        },
        {
          key: "showButton",
          label: "Hiển thị nút WhatsApp",
          type: "boolean",
          description: "Bật/tắt hiển thị nút gọi WhatsApp trên giao diện",
          isRequired: false,
        },
      ],
    },
  ],
};
