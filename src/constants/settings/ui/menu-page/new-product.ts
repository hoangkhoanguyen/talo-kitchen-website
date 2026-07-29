import { ConfigValue } from "@/types/configs";
import { MetaValue } from "@/types/settings";

export const newProductInitValue: ConfigValue = {
  isShow: true,
  title: [
    {
      text: "New Arrivals",
    },
    {
      text: "Fresh Flavors to Try",
    },
  ],
  sub_title: [
    {
      text: "Discover Our Latest Culinary Creations",
    },
    {
      text: "Exciting New Dishes Await You",
    },
  ],
  description:
    "Be the first to savor our newest additions, crafted with the freshest ingredients and innovative flavors.",
  product_slug: "",
  banner: {
    url: "",
    alt: "New Food Banner",
  },
  label: "New",
  sub_label: "Arrival",
};

export const newProductMeta: MetaValue = {
  key: "new_product",
  title: "Cấu hình Sản phẩm mới trang Menu",
  description: "Cấu hình các phần giao diện của Sản phẩm mới trang Menu",
  fields: [
    {
      key: "isShow",
      type: "boolean",
      label: "Hiển thị phần Sản phẩm mới",
      description: "Bật hoặc tắt hiển thị phần Sản phẩm mới trên trang Menu",
      isRequired: true,
    },
    {
      key: "title",
      type: "array",
      label: "Tiêu đề chính",
      description: "Tiêu đề chính hiển thị trên phần Sản phẩm mới",
      isEditableList: true,
      isRequired: true,
      itemType: {
        type: "object",
        fields: [
          {
            key: "text",
            type: "text",
            label: "Tiêu đề",
            description: "Tiêu đề hiển thị trên phần Sản phẩm mới",
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
      description: "Tiêu đề phụ hiển thị trên phần Sản phẩm mới",
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
            description: "Tiêu đề phụ hiển thị trên phần Sản phẩm mới",
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
      description: "Mô tả hiển thị trên phần Sản phẩm mới",
      isRequired: true,
      placeholder: "Nhập mô tả",
    },
    {
      key: "product_slug",
      type: "text",
      label: "Slug sản phẩm mới",
      description:
        "Slug của sản phẩm mới nhất sẽ được hiển thị trên phần Sản phẩm mới (nếu điền sai slug sẽ không hiển thị được phần này)",
      isRequired: true,
      placeholder: "Nhập slug sản phẩm mới",
    },
    {
      key: "banner",
      type: "image",
      label: "Ảnh banner",
      description: "Ảnh banner hiển thị trên phần Sản phẩm mới",
      isRequired: true,
    },
    {
      key: "label",
      type: "text",
      label: "Nhãn sản phẩm mới",
      description: "Nhãn hiển thị trên sản phẩm mới",
      isRequired: true,
      placeholder: "Nhập nhãn sản phẩm mới",
    },
    {
      key: "sub_label",
      type: "text",
      label: "Nhãn phụ sản phẩm mới",
      description: "Nhãn phụ hiển thị trên sản phẩm mới",
      isRequired: true,
      placeholder: "Nhập nhãn phụ sản phẩm mới",
    },
  ],
};
