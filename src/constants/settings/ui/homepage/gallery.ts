import { ConfigValue } from "@/types/configs";
import { FieldType, MetaValue } from "@/types/settings";

const fields: FieldType[] = [
  {
    key: "title",
    type: "array",
    label: "Tiêu đề",
    description: "Tiêu đề lớn trên phần Gallery",
    isEditableList: true,
    isRequired: true,
    itemType: {
      type: "object",
      fields: [
        {
          key: "text",
          type: "text",
          label: "Tiêu đề",
          description: "Tiêu đề hiển thị trên phần Gallery",
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
    description: "Tiêu đề phụ nhỏ hiển thị trên phần Gallery",
    isEditableList: true,
    isRequired: true,
    itemType: {
      type: "object",
      fields: [
        {
          key: "text",
          type: "text",
          label: "Tiêu đề phụ",
          description: "Tiêu đề phụ hiển thị trên phần Gallery",
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
    key: "images",
    type: "array",
    label: "Danh sách ảnh",
    description: "Danh sách hình ảnh hiển thị trong phần Gallery",
    isEditableList: true,
    isRequired: true,
    itemType: {
      type: "object",
      needBox: true,
      fields: [
        {
          key: "image",
          type: "image",
          label: "Ảnh",
          description: "Ảnh hiển thị trong phần Gallery",
          isRequired: true,
        },
        {
          type: "text",
          key: "title",
          label: "Tiêu đề ảnh",
          description: "Tiêu đề hiển thị dưới ảnh",
          isRequired: true,
          placeholder: "Nhập tiêu đề ảnh",
        },
        {
          type: "text",
          key: "sub_title",
          label: "Tiêu đề phụ ảnh",
          description: "Tiêu đề phụ hiển thị dưới ảnh",
          isRequired: true,
          placeholder: "Nhập tiêu đề phụ ảnh",
        },
      ],
    },
    needBox: true,
    newItem: {
      image: {
        url: "",
        alt: "",
      },
      title: "",
      sub_title: "",
    },
  },
  {
    key: "autoplay",
    type: "boolean",
    label: "Tự động chuyển ảnh",
    description: "Bật để tự động chuyển ảnh trong phần Gallery",
    isRequired: true,
  },
];

export const galleryMeta: MetaValue = {
  key: "gallery",
  title: "Phần Gallery",
  description: "Cấu hình phần Gallery trên trang chủ",
  fields,
};

export const galleryInitValue: ConfigValue = {
  title: [
    {
      text: "Our Gallery",
    },
  ],
  sub_title: [
    {
      text: "Welcome to our gallery",
    },
  ],
  images: [
    {
      image: {
        url: "/images/gallery1.jpg",
        alt: "Gallery Image 1",
      },
      title: "Gallery Image 1",
      sub_title: "Description for Gallery Image 1",
    },
  ],
  autoplay: true,
};
