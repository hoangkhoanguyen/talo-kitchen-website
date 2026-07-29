import { ConfigValue } from "@/types/configs";
import { MetaValue } from "@/types/settings";

export const heroInitConfigValue: ConfigValue = {
  title: [
    {
      text: "Explore Our Delicious Menu",
    },
    {
      text: "Savor the Flavors of France",
    },
  ],
  banner: {
    url: "",
    alt: "Reservation Banner",
  },
};

export const heroMeta: MetaValue = {
  key: "hero",
  title: "Phần banner trang đặt bàn",
  description: "Cấu hình phần banner của trang đặt bàn",
  fields: [
    {
      key: "title",
      type: "array",
      label: "Tiêu đề chính",
      description: "Tiêu đề chính hiển thị trên phần Hero",
      isEditableList: true,
      isRequired: true,
      itemType: {
        type: "object",
        fields: [
          {
            key: "text",
            type: "text",
            label: "Tiêu đề",
            description: "Tiêu đề hiển thị trên phần Hero",
            isRequired: true,
            placeholder: "Nhập tiêu đề",
          },
        ],
      },
      newItem: {
        text: "",
      },
    },
    {
      key: "banner",
      type: "image",
      label: "Hình ảnh banner",
      description: "Hình ảnh hiển thị trên phần Hero",
      isRequired: true,
    },
  ],
};
