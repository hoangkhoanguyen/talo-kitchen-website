import { ConfigValue } from "@/types/configs";
import { MetaValue } from "@/types/settings";

export const reservationClosedModeInitValue: ConfigValue = {
  isClosed: false,
  sub_title: [
    {
      text: "We'll be back soon",
    },
  ],
  title: [
    {
      text: "Reservation Service Temporarily Unavailable",
    },
  ],
  message:
    "We're currently not accepting reservations online. Please call us directly to make a reservation. Thank you for your understanding!",
};

export const reservationClosedModeMeta: MetaValue = {
  key: "closed_mode",
  title: "Chế độ nghỉ đặt bàn",
  description:
    "Cấu hình chế độ nghỉ cho chức năng đặt bàn - khi bật sẽ ngừng nhận đặt bàn online",
  fields: [
    {
      key: "isClosed",
      type: "boolean",
      label: "Tạm ngưng đặt bàn",
      description:
        "Bật/tắt chế độ nghỉ đặt bàn. Khi bật, khách hàng sẽ không thể đặt bàn online",
      isRequired: true,
    },
    {
      key: "sub_title",
      type: "array",
      label: "Tiêu đề phụ",
      description: "Tiêu đề phụ nhỏ hiển thị ở trên",
      isEditableList: true,
      isRequired: true,
      itemType: {
        type: "object",
        needBox: false,
        fields: [
          {
            key: "text",
            type: "text",
            label: "Thành phần tiêu đề phụ",
            description: "Tiêu đề phụ hiển thị trên trang thông báo",
            isRequired: true,
            placeholder: "Ví dụ: We'll be back soon",
          },
        ],
      },
      newItem: {
        text: "",
      },
    },
    {
      key: "title",
      type: "array",
      label: "Tiêu đề chính",
      description: "Tiêu đề chính lớn hiển thị ở dưới tiêu đề phụ",
      isEditableList: true,
      isRequired: true,
      itemType: {
        type: "object",
        needBox: false,
        fields: [
          {
            key: "text",
            type: "text",
            label: "Tiêu đề",
            description: "Tiêu đề chính hiển thị trên trang thông báo",
            isRequired: true,
            placeholder: "Ví dụ: Reservation Service Temporarily Unavailable",
          },
        ],
      },
      newItem: {
        text: "",
      },
    },
    {
      key: "message",
      type: "textarea",
      label: "Nội dung lời nhắn",
      description: "Nội dung chi tiết thông báo khi tạm ngưng nhận đặt bàn",
      isRequired: true,
      placeholder:
        "Ví dụ: We're currently not accepting reservations online. Please call us directly...",
    },
  ],
};
