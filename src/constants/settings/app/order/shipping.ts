import { EShippingMethod } from "@/types/app-configs";
import { ConfigValue } from "@/types/configs";
import { MetaValue } from "@/types/settings";

export const shippingInitValue: ConfigValue = {
  methods: [
    {
      method: EShippingMethod.door2door,
      label: "Door-to-door Delivery",
      description:
        "We will free shipping for orders over 500,000 VND and within a radius of 5km, greater than 5km we will support you 30,000 VND. If the order is under 500,000 VND we will charge 30,000 VND for shipping fee.",
      isDefault: true,
    },
    {
      method: EShippingMethod.pickup,
      label: "Pick up restaurant",
      description:
        "When you select this option, restaurant staff will contact you to ask for your pick-up time.",
      isDefault: false,
    },
  ],
  rules: [
    {
      minOrderValue: 500000,
      shippingFee: 0,
      description: "Miễn phí shipping cho đơn hàng trên 500,000 VND",
    },
    {
      minOrderValue: 200000,
      shippingFee: 20000,
      description: "Phí shipping 20,000 VND cho đơn hàng trên 200,000 VND",
    },
    {
      minOrderValue: 0,
      shippingFee: 30000,
      description: "Phí ship 30,000 VND mặc định",
    },
  ],
};

export const shippingMeta: MetaValue = {
  key: "shipping",
  title: "Cấu hình giao hàng",
  description: "Cấu hình giao hàng",
  fields: [
    {
      key: "methods",
      type: "array",
      label: "Phương thức giao hàng",
      description: "Danh sách các phương thức giao hàng",
      isEditableList: false,
      isRequired: true,
      needBox: true,
      itemType: {
        type: "object",
        needBox: true,
        fields: [
          {
            key: "method",
            type: "text",
            label: "Mã Phương thức",
            description: "Mã Phương thức giao hàng",
            disabled: true,
            isRequired: true,
          },
          {
            key: "label",
            type: "text",
            label: "Nhãn",
            description: "Nhãn hiển thị cho phương thức giao hàng",
            isRequired: true,
            placeholder: "Nhập nhãn cho phương thức giao hàng",
          },
          {
            key: "description",
            type: "textarea",
            label: "Mô tả",
            description: "Mô tả cho phương thức giao hàng",
            isRequired: true,
            placeholder: "Nhập mô tả cho phương thức giao hàng",
          },
          {
            key: "isDefault",
            type: "boolean",
            label: "Mặc định",
            description:
              "Chọn phương thức giao hàng này làm phương thức mặc định",
            isRequired: true,
          },
        ],
      },
      newItem: {
        method: EShippingMethod.door2door,
        label: "",
        description: "",
      },
    },
    {
      key: "rules",
      type: "array",
      label: "Quy tắc tính phí giao hàng",
      description: "Danh sách các quy tắc tính phí giao hàng",
      isEditableList: true,
      isRequired: true,
      needBox: true,
      itemType: {
        type: "object",
        needBox: true,
        fields: [
          {
            key: "minOrderValue",
            type: "number",
            label: "Giá trị đơn hàng tối thiểu",
            description:
              "Giá trị đơn hàng tối thiểu để áp dụng quy tắc này (VND)",
            isRequired: true,
            placeholder: "Nhập giá trị đơn hàng tối thiểu",
          },
          {
            key: "shippingFee",
            type: "number",
            label: "Phí giao hàng",
            description:
              "Phí giao hàng áp dụng khi đạt giá trị đơn hàng tối thiểu (VND)",
            isRequired: true,
            placeholder: "Nhập phí giao hàng",
          },
          {
            key: "description",
            type: "text",
            label: "Mô tả",
            description: "Mô tả cho quy tắc tính phí giao hàng",
            isRequired: true,
            placeholder: "Nhập mô tả cho quy tắc tính phí giao hàng",
          },
        ],
      },
      newItem: {
        minOrderValue: 0,
        shippingFee: 0,
        description: "",
      },
    },
  ],
};
