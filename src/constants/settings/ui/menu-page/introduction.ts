import { ConfigValue } from "@/types/configs";
import { MetaValue } from "@/types/settings";

export const introductionInitValue: ConfigValue = {
  title: [
    {
      text: "Welcome to Our Culinary Haven",
    },
    {
      text: "A Taste of France in Every Bite",
    },
  ],
  sub_title: [
    {
      text: "Discover the Art of French Cuisine",
    },
    {
      text: "Experience Authentic Flavors and Warm Hospitality",
    },
  ],
  description:
    "Indulge in a culinary journey through the heart of France with our exquisite menu.",
};

export const introductionMeta: MetaValue = {
  key: "introduction",
  title: "Cấu hình Giới thiệu trang Menu",
  description: "Cấu hình các phần giao diện của Giới thiệu trang Menu",
  fields: [
    {
      key: "title",
      type: "array",
      label: "Tiêu đề chính",
      description: "Tiêu đề chính hiển thị trên phần Giới thiệu",
      isEditableList: true,
      isRequired: true,
      needBox: true,
      itemType: {
        type: "object",
        fields: [
          {
            key: "text",
            type: "text",
            label: "Tiêu đề",
            description: "Tiêu đề hiển thị trên phần Giới thiệu",
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
      key: "sub_title",
      type: "array",
      label: "Tiêu đề phụ",
      description: "Tiêu đề phụ hiển thị trên phần Giới thiệu",
      isEditableList: true,
      isRequired: true,
      needBox: true,
      itemType: {
        type: "object",
        fields: [
          {
            key: "text",
            type: "text",
            label: "Tiêu đề phụ",
            description: "Tiêu đề phụ hiển thị trên phần Giới thiệu",
            isRequired: true,
            placeholder: "Nhập tiêu đề phụ",
          },
        ],
      },
      newItem: {
        text: "",
      },
    },
    {
      key: "description",
      type: "textarea",
      label: "Mô tả",
      description: "Mô tả hiển thị trên phần Giới thiệu",
      isRequired: true,
      placeholder: "Nhập mô tả",
    },
  ],
};
