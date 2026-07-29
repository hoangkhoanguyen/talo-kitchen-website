import { ConfigValue } from "@/types/configs";
import { MetaValue } from "@/types/settings";

export const foodCategoriesInitValue: ConfigValue = {
  title: [
    {
      text: "Our Menu Categories",
    },
    {
      text: "Diverse Flavors to Satisfy Every Palate",
    },
  ],
  sub_title: [
    {
      text: "From Appetizers to Desserts",
    },
    {
      text: "A Culinary Adventure Awaits",
    },
  ],
  categories_to_show: [
    {
      key: "",
      label: "",
      page_title: "",
    },
  ],
};

export const foodCategoriesMeta: MetaValue = {
  key: "food_categories",
  title: "Cấu hình Danh mục món ăn trang Menu",
  description: "Cấu hình các phần giao diện của Danh mục món ăn trang Menu",
  fields: [
    {
      key: "title",
      type: "array",
      label: "Tiêu đề chính",
      description: "Tiêu đề chính hiển thị trên phần Danh mục món ăn",
      isEditableList: true,
      isRequired: true,
      itemType: {
        type: "object",
        fields: [
          {
            key: "text",
            type: "text",
            label: "Tiêu đề",
            description: "Tiêu đề hiển thị trên phần Danh mục món ăn",
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
      description: "Tiêu đề phụ hiển thị trên phần Danh mục món ăn",
      isEditableList: true,
      isRequired: true,
      itemType: {
        type: "object",
        fields: [
          {
            key: "text",
            type: "text",
            label: "Tiêu đề phụ",
            description: "Tiêu đề phụ hiển thị trên phần Danh mục món ăn",
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
      key: "categories_to_show",
      type: "array",
      label: "Danh mục món ăn hiển thị",
      description: "Các danh mục món ăn sẽ được hiển thị trên trang Menu",
      isEditableList: true,
      isRequired: true,
      needBox: true,
      itemType: {
        type: "object",
        needBox: true,
        fields: [
          {
            key: "key",
            type: "text",
            label: "Key",
            description:
              "Key của danh mục món ăn (copy từ trang Quản lý danh mục món ăn)",
            isRequired: true,
            placeholder: "Nhập key",
          },
          {
            key: "label",
            type: "text",
            label: "Nhãn",
            description: "Nhãn hiển thị cho danh mục món ăn",
            isRequired: true,
            placeholder: "Nhập nhãn",
          },
          {
            key: "page_title",
            type: "text",
            label: "Page Title",
            description:
              "Tiêu đề trang cho category này (hiển thị trên tab trình duyệt)",
            isRequired: false,
            placeholder: "Ví dụ: Main Course - TALO Kitchen & Lounge",
          },
        ],
      },
      newItem: {
        key: "",
        label: "",
        page_title: "",
      },
    },
  ],
};
