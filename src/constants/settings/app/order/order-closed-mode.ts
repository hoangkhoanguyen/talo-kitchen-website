import { ConfigValue } from "@/types/configs";
import { MetaValue } from "@/types/settings";

export const closedModeInitValue: ConfigValue = {
  isClosed: false,
  sub_title: [
    {
      text: "We'll be back soon",
    },
  ],
  title: [
    {
      text: "Online Ordering Temporarily Unavailable",
    },
  ],
  message:
    "We're currently not accepting online orders. Please check back later or contact us directly. Thank you for your understanding!",
};

export const closedModeMeta: MetaValue = {
  key: "closed_mode",
  title: "Chế độ nghỉ đặt hàng",
  description:
    "Cấu hình chế độ nghỉ cho chức năng đặt hàng online - khi bật sẽ ngừng nhận đơn hàng",
  fields: [
    {
      key: "isClosed",
      type: "boolean",
      label: "Tạm ngưng đặt hàng",
      description:
        "Bật/tắt chế độ nghỉ đặt hàng. Khi bật, khách hàng sẽ không thể đặt hàng online",
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
            placeholder: "Ví dụ: Online Ordering Temporarily Unavailable",
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
      description: "Nội dung chi tiết thông báo khi tạm ngưng nhận đơn hàng",
      isRequired: true,
      placeholder:
        "Ví dụ: We're currently not accepting online orders. Please check back later...",
    },
  ],
};
