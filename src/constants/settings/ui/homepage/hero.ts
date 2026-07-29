import { ConfigValue } from "@/types/configs";
import { FieldType, MetaValue } from "@/types/settings";

const heroFields: FieldType[] = [
  {
    key: "title",
    type: "array",
    label: "Tiêu đề",
    description: "Tiêu đề hiển thị trên phần hero",
    isEditableList: true,
    isRequired: true,
    newItem: {
      text: "",
    },
    itemType: {
      type: "object",
      fields: [
        {
          key: "text",
          type: "text",
          label: "Tiêu đề",
          description: "Tiêu đề hiển thị trên phần hero",
          isRequired: true,
          placeholder: "Nhập tiêu đề",
        },
      ],
    },
  },
  {
    key: "isShowTitle",
    type: "boolean",
    label: "Hiển thị tiêu đề",
    description: "Bật để hiển thị tiêu đề trên phần hero",
    isRequired: false,
  },
  {
    key: "image",
    type: "image",
    label: "Ảnh nền",
    description: "Ảnh nền hiển thị trên phần hero",
    isRequired: false,
  },
];

export const heroInitialValue: ConfigValue = {
  title: [
    { text: "Where Frech" },
    { text: "Culinary Art" },
    {
      text: "Meet Vietnamese Soul",
    },
  ],
  image: {
    url: "",
    alt: "Hero Image",
  },
  isShowTitle: true,
};

export const heroMeta: MetaValue = {
  key: "hero",
  title: "Phần Hero",
  description: "Cấu hình phần banner lớn ở đầu trang chủ",
  fields: heroFields,
};
