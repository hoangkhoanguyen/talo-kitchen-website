import { ConfigValue } from "@/types/configs";
import { MetaValue } from "@/types/settings";

export const reservationInitValue: ConfigValue = {
  size_options: [
    {
      value: "1-2",
    },
  ],
};

export const reservationMeta: MetaValue = {
  key: "reservation",
  title: "Cấu hình đặt bàn",
  description: "Cấu hình đặt bàn",
  fields: [
    {
      key: "size_options",
      type: "array",
      label: "Tùy chọn số lượng khách",
      description: "Tùy chọn số lượng khách cho việc đặt bàn",
      isEditableList: true,
      isRequired: true,
      itemType: {
        type: "object",
        needBox: true,
        fields: [
          {
            key: "value",
            type: "text",
            label: "Số lượng khách",
            description: "Số lượng khách (ví dụ: 1-2, 3-4, 5-6, ...)",
            isRequired: true,
            placeholder: "Nhập số lượng khách",
          },
        ],
      },
      newItem: {
        value: "",
      },
    },
  ],
};
