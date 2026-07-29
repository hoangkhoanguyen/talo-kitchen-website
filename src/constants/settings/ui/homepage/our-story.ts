import { ConfigValue } from "@/types/configs";
import { FieldType, MetaValue } from "@/types/settings";

const fields: FieldType[] = [
  {
    key: "title",
    type: "array",
    label: "Tiêu đề",
    description: "Tiêu đề lớn trên phần Our Story",
    isEditableList: true,
    isRequired: true,
    itemType: {
      type: "object",
      fields: [
        {
          key: "text",
          type: "text",
          label: "Tiêu đề",
          description: "Tiêu đề hiển thị trên phần Our Story",
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
    description: "Tiêu đề phụ nhỏ hiển thị trên phần Our Story",
    isEditableList: true,
    isRequired: true,
    itemType: {
      type: "object",
      fields: [
        {
          key: "text",
          type: "text",
          label: "Tiêu đề phụ",
          description: "Tiêu đề phụ hiển thị trên phần Our Story",
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
    key: "content",
    type: "textarea",
    label: "Nội dung hiển thị trong đoạn văn",
    description: "Enter để xuống dòng",
    isRequired: true,
    placeholder: "Nhập nội dung",
  },
  {
    key: "image",
    type: "image",
    label: "Ảnh minh họa",
    description: "Ảnh minh họa hiển thị trên phần Our Story",
    isRequired: true,
  },
];

export const ourStoryMeta: MetaValue = {
  key: "our_story",
  description: "Thiết lập phần Our Story trên trang chủ",
  title: "Phần Our Story",
  fields,
};

export const ourStoryInitialValue: ConfigValue = {
  title: [
    { text: "A Love Letter To" },
    {
      text: "Frech Gastronomy",
    },
  ],
  sub_title: [
    { text: "TALO Kitchen & Lounge" },
    {
      text: "Our Story",
    },
  ],
  content:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  image: { url: "", alt: "Our Story Image" },
};
