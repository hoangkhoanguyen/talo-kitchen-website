import { ConfigValue } from "@/types/configs";
import { FieldType, MetaValue } from "@/types/settings";

const fields: FieldType[] = [
  {
    key: "title",
    type: "array",
    label: "Tiêu đề",
    description: "Tiêu đề lớn trên phần Reviews",
    isEditableList: true,
    isRequired: true,
    itemType: {
      type: "object",
      fields: [
        {
          key: "text",
          type: "text",
          label: "Tiêu đề",
          description: "Tiêu đề hiển thị trên phần Reviews",
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
    description: "Tiêu đề phụ nhỏ hiển thị trên phần Reviews",
    isEditableList: true,
    isRequired: true,
    itemType: {
      type: "object",
      fields: [
        {
          key: "text",
          type: "text",
          label: "Tiêu đề phụ",
          description: "Tiêu đề phụ hiển thị trên phần Reviews",
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
    description: "Mô tả ngắn gọn về phần Reviews",
    isRequired: false,
    placeholder: "Nhập mô tả",
  },
  {
    key: "reviews_list",
    type: "array",
    label: "Danh sách Reviews",
    description: "Danh sách các đánh giá của khách hàng",
    isEditableList: true,
    isRequired: false,
    needBox: true,
    itemType: {
      type: "object",
      needBox: true,
      fields: [
        {
          key: "customer_name",
          type: "text",
          label: "Tên khách hàng",
          description: "Tên của khách hàng đánh giá",
          isRequired: true,
          placeholder: "Nhập tên khách hàng",
        },
        {
          key: "rating",
          type: "number",
          label: "Đánh giá",
          description: "Số sao đánh giá (1-5)",
          isRequired: true,
          placeholder: "Nhập số sao",
        },
        {
          key: "comment",
          type: "textarea",
          label: "Bình luận",
          description: "Nội dung đánh giá của khách hàng",
          isRequired: true,
          placeholder: "Nhập nội dung đánh giá",
        },
        {
          key: "date",
          type: "text",
          label: "Ngày đánh giá",
          description: "Ngày khách hàng để lại đánh giá",
          isRequired: true,
          placeholder: "Nhập ngày đánh giá",
        },
      ],
    },
    newItem: {
      customer_name: "",
      rating: 5,
      comment: "",
      date: "",
    },
  },
  {
    key: "below_box",
    type: "object",
    label: "Phần bên dưới danh sách Reviews",
    description: "Cấu hình phần box bên dưới danh sách Reviews",
    isRequired: false,
    needBox: true,
    fields: [
      {
        key: "title",
        type: "text",
        label: "Tiêu đề",
        description: "Tiêu đề hiển thị trong box bên dưới",
        isRequired: true,
        placeholder: "Nhập tiêu đề",
      },
      {
        key: "description",
        type: "textarea",
        label: "Mô tả",
        description: "Mô tả hiển thị trong box bên dưới",
        isRequired: true,
        placeholder: "Nhập mô tả",
      },
    ],
  },
];

export const reviewsMeta: MetaValue = {
  key: "reviews",
  title: "Phần Reviews",
  description: "Cấu hình phần Reviews trên trang chủ",
  fields,
};

export const reviewsInitValue: ConfigValue = {
  title: [
    {
      text: "What Our Customers Say",
    },
  ],
  sub_title: [
    {
      text: "Customer Reviews",
    },
  ],
  description: "Chúng tôi yêu thích nhận được phản hồi từ khách hàng!",
  reviews_list: [],
  below_box: {
    title: "Ready to Create Your Own Memorable Experience?",
    description:
      "Join hundreds of satisfied international guests who have discovered the magic of French cuisine in the heart of Ninh Binh.",
  },
};
