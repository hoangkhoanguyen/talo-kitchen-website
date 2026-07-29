import { ConfigValue } from "@/types/configs";
import { FieldType, MetaValue } from "@/types/settings";

const fields: FieldType[] = [
  {
    key: "title",
    type: "array",
    label: "Tiêu đề",
    description: "Tiêu đề lớn trên phần Why Choose Us",
    isEditableList: true,
    isRequired: true,
    itemType: {
      type: "object",
      fields: [
        {
          key: "text",
          type: "text",
          label: "Tiêu đề",
          description: "Tiêu đề hiển thị trên phần Why Choose Us",
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
    description: "Tiêu đề phụ nhỏ hiển thị trên phần Why Choose Us",
    isEditableList: true,
    isRequired: true,
    itemType: {
      type: "object",
      fields: [
        {
          key: "text",
          type: "text",
          label: "Tiêu đề phụ",
          description: "Tiêu đề phụ hiển thị trên phần Why Choose Us",
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
    label: "Mô tả ngắn",
    description: "Mô tả hiển thị trên phần Why Choose Us",
    isRequired: true,
    placeholder: "Nhập mô tả",
  },
  {
    key: "reasons",
    type: "array",
    label: "Lý do",
    description: "Danh sách lý do hiển thị trên phần Why Choose Us",
    isEditableList: false,
    isRequired: true,
    newItem: {
      icon: "",
      title: "",
      desc: "",
    },
    needBox: true,
    itemType: {
      type: "object",
      needBox: true,
      fields: [
        {
          key: "icon",
          type: "text",
          label: "Icon",
          description:
            "Icon hiển thị cho lý do (Vào link https://icon-sets.iconify.design/ph để lấy tên icon)",
          isRequired: true,
          placeholder: "Nhập tên icon",
        },
        {
          key: "title",
          type: "text",
          label: "Tiêu đề",
          description: "Tiêu đề hiển thị cho lý do",
          isRequired: true,
          placeholder: "Nhập tiêu đề",
        },
        {
          key: "desc",
          type: "text",
          label: "Mô tả",
          description: "Mô tả hiển thị cho lý do",
          isRequired: true,
          placeholder: "Nhập mô tả",
        },
      ],
    },
  },
];

export const whyChooseUsMeta: MetaValue = {
  title: "Phần Why Choose Us",
  description: "Thiết lập phần Why Choose Us trên trang chủ",
  key: "why_choose_us",
  fields,
};

export const whyChooseUsInitialValue: ConfigValue = {
  title: [{ text: "Why customers" }, { text: "choose us" }],
  sub_title: [
    { text: "EXCELLENCE" },
    { text: "DISTINCTION" },
    { text: "QUALITY" },
  ],
  description:
    "Discover what makes L’Telle Eater the premier French dining destination in Ha Giang, where every detail is crafted to exceed your expectations.",
  reasons: [
    {
      icon: "ph:leaf",
      title: "Fresh Ingredients",
      desc: "We use only the freshest ingredients sourced from local farms.",
    },
    {
      icon: "ph:users",
      title: "Exceptional Service",
      desc: "Our staff is dedicated to providing a memorable dining experience.",
    },
    {
      icon: "ph:house",
      title: "Expert Chefs",
      desc: "Our chefs bring authentic French flavors to every dish.",
    },
  ],
};
