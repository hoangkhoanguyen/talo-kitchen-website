import { ConfigValue } from "@/types/configs";
import { FieldType, MetaValue } from "@/types/settings";

const fields: FieldType[] = [
  {
    key: "title",
    type: "array",
    label: "Tiêu đề",
    description: "Tiêu đề lớn trên phần Contact",
    isEditableList: true,
    isRequired: true,
    itemType: {
      type: "object",
      fields: [
        {
          key: "text",
          type: "text",
          label: "Tiêu đề",
          description: "Tiêu đề hiển thị trên phần Contact",
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
    description: "Tiêu đề phụ nhỏ hiển thị trên phần Contact",
    isEditableList: true,
    isRequired: true,
    itemType: {
      type: "object",
      needBox: false,
      fields: [
        {
          key: "text",
          type: "text",
          label: "Thành phần tiêu đề phụ",
          description: "Tiêu đề phụ hiển thị trên phần Contact",
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
    description: "Mô tả ngắn gọn về phần Contact",
    isRequired: false,
    placeholder: "Nhập mô tả",
  },
  {
    key: "location",
    type: "object",
    label: "Vị trí",
    description: "Thông tin vị trí cửa hàng",
    isRequired: false,
    needBox: true,
    fields: [
      {
        key: "address",
        type: "textarea",
        label: "Địa chỉ",
        description: "Địa chỉ cửa hàng",
        isRequired: false,
        placeholder: "Nhập địa chỉ",
      },
      {
        key: "ggmap_link",
        type: "text",
        label: "Link Google Map",
        description: "Link Google Map của cửa hàng",
        isRequired: false,
        placeholder: "Dán link Google Map",
      },
    ],
  },
  {
    key: "contact_info",
    type: "object",
    label: "Thông tin liên hệ",
    description: "Thông tin liên hệ của cửa hàng",
    isRequired: false,
    needBox: true,
    fields: [
      {
        key: "phone",
        type: "text",
        label: "Số điện thoại",
        description: "Số điện thoại liên hệ của cửa hàng",
        isRequired: false,
        placeholder: "Nhập Số điện thoại",
      },
      {
        key: "email",
        type: "text",
        label: "Email",
        description: "Email liên hệ của cửa hàng",
        isRequired: false,
        placeholder: "Nhập email",
      },
      {
        key: "whatsapp",
        type: "text",
        label: "WhatsApp",
        description:
          "Số WhatsApp liên hệ của cửa hàng (Bỏ dấu + và khoảng trắng)",
        isRequired: false,
        placeholder: "Nhập số WhatsApp",
      },
    ],
  },
  {
    key: "opening_hours",
    type: "array",
    label: "Giờ mở cửa",
    description: "Thông tin giờ mở cửa của cửa hàng",
    isRequired: false,
    isEditableList: true,
    needBox: true,
    itemType: {
      type: "object",
      fields: [
        {
          key: "title",
          type: "text",
          label: "Tiêu đề nhóm",
          description: "Phần text in đậm",
          isRequired: true,
          placeholder: "Nhập tiêu đề nhóm",
        },
        {
          key: "items",
          type: "array",
          label: "Danh sách",
          description: "Danh sách item trong nhóm",
          isRequired: true,
          isEditableList: true,
          needBox: true,
          itemType: {
            type: "object",
            needBox: true,
            fields: [
              {
                key: "label",
                type: "text",
                label: "Nhãn",
                description: "Ví dụ: Thứ 2 - Thứ 6",
                isRequired: true,
                placeholder: "Nhập nhãn",
              },
              {
                key: "value",
                type: "text",
                label: "Thông tin tương ứng với nhãn",
                description: "Ví dụ: 9:00 AM - 5:00 PM",
                isRequired: true,
                placeholder: "Nhập thông tin",
              },
            ],
          },
          newItem: {
            label: "",
            value: "",
          },
        },
        {
          key: "note",
          type: "textarea",
          label: "Ghi chú",
          description: "Dòng ghi chú nhỏ hiển thị bên dưới danh sách giờ",
          isRequired: false,
          placeholder: "Nhập ghi chú...",
        },
      ],
    },
    newItem: {
      title: "",
      items: [],
      note: "",
    },
  },
];

export const contactMeta: MetaValue = {
  key: "contact",
  title: "Phần Contact",
  description: "Cấu hình phần Contact trên trang chủ",
  fields,
};

export const contactInitValue: ConfigValue = {
  title: [
    {
      text: "Visit us",
    },
  ],
  sub_title: [
    {
      text: "Find us in",
    },
    {
      text: "Ha Giang",
    },
  ],
  description:
    "Located in the heart of Ha Giang with stunning views of the surrounding limestone mountains. Easily accessible from major hotels and tourist attractions.",
};
