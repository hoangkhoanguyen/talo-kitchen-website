import { webRoutes } from "@/constants/route";
import { ConfigValue } from "@/types/configs";
import { MetaValue } from "@/types/settings";

export const footerInitialValue: ConfigValue = {
  description:
    "Experience authentic French cuisine in the heart of Ha Giang. Our commitment to excellence and hospitality makes every visit memorable.",
  socials: [
    {
      icon: "ph:facebook-logo",
      href: "facebook.com",
    },
    {
      icon: "ph:instagram-logo",
      href: "instagram.com",
    },
    {
      icon: "ph:twitter-logo",
      href: "twitter.com",
    },
  ],
  quick_links: [
    { label: "Home", href: webRoutes.home(), title: "Welcome to Our Table" },
    { label: "Menu", href: webRoutes.menu("all"), title: "Explore Our Menu" },
    {
      label: "Reservations",
      href: webRoutes.reservation(),
      title: "Book a Table",
    },
  ],
  services: [
    { label: "Private Event Catering" },
    { label: "Wine Pairing Dinners" },
    { label: "Corporate Events" },
    { label: "Fine Dining Experience" },
    { label: "Special Celebrations" },
  ],
  contact: {
    address: "123 Culinary St, Ha Giang, Vietnam",
    phone: "(123) 456-7890",
    email: "info@restaurant.com",
  },
  opening_hours_title: "Opening Hours",
  opening_hours: [
    { label: "Mon - Sun", value: "9:00 AM - 10:00 PM" },
    { label: "Restaurant & Coffee", value: "9:00 AM - 2:00 PM" },
    { label: "Restaurant & Cocktail Bar", value: "5:00 PM - 1:00 AM" },
    { label: "Last order", value: "10:00 PM" },
  ],
};

export const footerMeta: MetaValue = {
  title: "Footer",
  description: "Footer section of the website",
  key: "footer",
  fields: [
    {
      key: "description",
      label: "Đoạn mô tả bên dưới logo",
      type: "text",
      description: "Mô tả hiển thị bên dưới logo trong phần footer",
      isRequired: false,
      localized: true,
    },
    {
      key: "socials",
      label: "Social Links",
      type: "array",
      description:
        "Danh sách các liên kết mạng xã hội hiển thị trong phần footer",
      isEditableList: true,
      isRequired: false,
      needBox: true,
      itemType: {
        type: "object",
        needBox: true,
        fields: [
          {
            key: "icon",
            label: "Icon",
            type: "text",
            description:
              "Vào link https://icon-sets.iconify.design để lấy tên icon",
            isRequired: true,
            placeholder: "Nhập tên icon",
          },
          {
            key: "href",
            label: "URL",
            type: "text",
            description: "Đường dẫn đến trang mạng xã hội",
            isRequired: true,
            placeholder: "Nhập URL",
          },
        ],
      },
      newItem: {
        icon: "",
        href: "",
      },
    },
    {
      key: "quick_links",
      label: "Quick Links",
      type: "array",
      description: "Danh sách các liên kết nhanh hiển thị trong phần footer",
      isEditableList: false,
      isRequired: false,
      needBox: true,
      itemType: {
        type: "object",
        needBox: true,
        fields: [
          {
            key: "label",
            label: "Label",
            type: "text",
            description: "Tên hiển thị của liên kết",
            isRequired: true,
            placeholder: "Nhập tên liên kết",
            localized: true,
          },
          {
            key: "href",
            label: "URL",
            type: "text",
            description: "Đường dẫn của liên kết",
            isRequired: true,
            placeholder: "Nhập URL",
            disabled: true,
          },
          {
            key: "title",
            label: "Title",
            type: "text",
            description:
              "Tiêu đề hiển thị khi hover vào liên kết (dùng cho SEO)",
            isRequired: true,
            placeholder: "Nhập tiêu đề",
            localized: true,
          },
        ],
      },
      newItem: {
        label: "",
        href: "",
      },
    },
    {
      key: "services",
      label: "Services",
      type: "array",
      description: "Danh sách các dịch vụ hiển thị trong phần footer",
      isEditableList: true,
      isRequired: false,
      itemType: {
        type: "object",
        needBox: true,
        fields: [
          {
            key: "label",
            label: "Tên hiển thị",
            type: "text",
            description: "Tên hiển thị của dịch vụ",
            isRequired: true,
            placeholder: "Nhập tên dịch vụ",
            localized: true,
          },
        ],
      },
      newItem: {
        label: "",
      },
    },
    {
      key: "contact",
      label: "Contact Information",
      type: "object",
      description: "Thông tin liên hệ hiển thị trong phần footer",
      isRequired: false,
      needBox: true,
      fields: [
        {
          key: "address",
          label: "Address",
          type: "textarea",
          description: "Địa chỉ liên hệ",
          isRequired: false,
          localized: true,
        },
        {
          key: "phone",
          label: "Phone",
          type: "text",
          description: "Số điện thoại liên hệ",
          isRequired: false,
        },
        {
          key: "email",
          label: "Email",
          type: "text",
          description: "Email liên hệ",
          isRequired: false,
        },
      ],
    },
    {
      key: "opening_hours_title",
      label: "Tiêu đề box giờ mở cửa",
      type: "text",
      description: "Tiêu đề hiển thị trong box giờ mở cửa ở footer",
      isRequired: false,
      placeholder: "Nhập tiêu đề",
      localized: true,
    },
    {
      key: "opening_hours",
      label: "Opening Hours",
      type: "array",
      description: "Danh sách thông tin giờ mở cửa hiển thị trong phần footer",
      isEditableList: true,
      isRequired: false,
      needBox: true,
      itemType: {
        type: "object",
        needBox: true,
        fields: [
          {
            key: "label",
            label: "Nhãn",
            type: "text",
            description: "Ví dụ: Mon - Sun",
            isRequired: true,
            placeholder: "Nhập nhãn",
            localized: true,
          },
          {
            key: "value",
            label: "Giờ",
            type: "text",
            description: "Ví dụ: 9:00 AM - 10:00 PM",
            isRequired: true,
            placeholder: "Nhập giờ",
          },
        ],
      },
      newItem: {
        label: "",
        value: "",
      },
    },
  ],
};
