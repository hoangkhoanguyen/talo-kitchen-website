import { ConfigValue } from "@/types/configs";
import { MetaValue } from "@/types/settings";

export const heroInitValue: ConfigValue = {
  title: [
    {
      text: "Explore Our Delicious Menu",
    },
    {
      text: "Savor the Flavors of France",
    },
  ],
  images: [
    {
      url: "",
      alt: "Menu Image 1",
    },
    {
      url: "",
      alt: "Menu Image 2",
    },
    {
      url: "",
      alt: "Menu Image 3",
    },
  ],
  autoplay: true,
};

export const heroMeta: MetaValue = {
  key: "hero",
  title: "Cấu hình Hero trang Menu",
  description: "Cấu hình các phần giao diện của Hero trang Menu",
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
      key: "images",
      type: "array",
      label: "Danh sách ảnh",
      description: "Danh sách ảnh hiển thị trên phần Hero",
      isEditableList: true,
      isRequired: true,
      needBox: true,
      itemType: {
        type: "image",
      },
      newItem: {
        url: "",
        alt: "Menu Image",
      },
    },
    {
      key: "autoplay",
      type: "boolean",
      label: "Tự động chuyển ảnh",
      description: "Bật để tự động chuyển ảnh trong phần Hero",
      isRequired: false,
    },
  ],
};
