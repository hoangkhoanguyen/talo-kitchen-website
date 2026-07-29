import { webRoutes } from "@/constants/route";
import { ConfigValue } from "@/types/configs";
import { MetaValue } from "@/types/settings";

export const headerInitValue: ConfigValue = {
  phone: "",
  open_daily: "",
  nav_bar: [
    {
      label: "Home",
      title: "Home",
      href: webRoutes.home(),
    },
    {
      label: "Menu",
      title: "Menu",
      href: webRoutes.menu("all"),
    },
    {
      label: "Reservations",
      title: "Reservations",
      href: webRoutes.reservation(),
    },
  ],
  welcom_text: "Welcome to Ha Giang",
};

export const headerMeta: MetaValue = {
  key: "header",
  title: "Cấu hình Header",
  description: "Cấu hình các phần giao diện của Header",
  fields: [
    {
      key: "phone",
      type: "text",
      label: "Số điện thoại",
      description: "Số điện thoại hiển thị trên header",
      isRequired: false,
      placeholder: "Nhập số điện thoại",
    },
    {
      key: "open_daily",
      type: "text",
      label: "Giờ mở cửa hàng ngày",
      description:
        "Giờ mở cửa hàng ngày hiển thị trên header (ví dụ: 8:00 AM - 10:00 PM)",
      isRequired: false,
      placeholder: "Nhập giờ mở cửa hàng ngày",
    },
    {
      key: "welcom_text",
      type: "text",
      label: "Văn bản chào mừng",
      description: "Văn bản chào mừng hiển thị trên header bên phải",
      isRequired: false,
      placeholder: "Nhập văn bản chào mừng",
    },
    {
      key: "nav_bar",
      type: "array",
      label: "Thanh điều hướng",
      description: "Danh sách các mục trong thanh điều hướng",
      isEditableList: false,
      isRequired: true,
      needBox: true,
      newItem: {
        label: "",
        href: "",
      },
      itemType: {
        type: "object",
        needBox: true,
        fields: [
          {
            key: "label",
            type: "text",
            label: "Nhãn",
            description: "Nhãn hiển thị trên thanh điều hướng",
            isRequired: true,
            placeholder: "Nhập nhãn",
          },
          {
            key: "href",
            type: "text",
            label: "Liên kết",
            description: "Liên kết của mục trong thanh điều hướng",
            isRequired: true,
            placeholder: "Nhập liên kết",
            disabled: true,
          },
          {
            key: "title",
            type: "text",
            label: "Tiêu đề",
            description: "Tốt cho SEO",
            isRequired: true,
            placeholder: "Nhập tiêu đề (Dùng để SEO)",
          },
        ],
      },
    },
  ],
};
