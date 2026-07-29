import { ConfigValue } from "@/types/configs";
import { MetaValue } from "@/types/settings";

export const seoInitialValue: ConfigValue = {
  title: "TALO Kitchen & Lounge - Home",
  description:
    "Welcome to TALO Kitchen & Lounge, where culinary excellence meets a warm and inviting atmosphere. Discover our diverse menu, crafted with the freshest ingredients to tantalize your taste buds. Join us for an unforgettable dining experience that celebrates flavor, creativity, and community.",
  keywords: [
    { keyword: "TALO Kitchen & Lounge" },
    { keyword: "restaurant" },
    { keyword: "dining" },
    { keyword: "culinary" },
    { keyword: "food" },
    { keyword: "Ha Giang" },
  ],
  og_title: "TALO Kitchen & Lounge - Fine Dining Experience",
  og_description:
    "Welcome to TALO Kitchen & Lounge, where culinary excellence meets a warm and inviting atmosphere. Discover our diverse menu, crafted with the freshest ingredients.",
  og_image: {
    url: "/assets/static/og-image.jpg",
    alt: "TALO Kitchen & Lounge - Fine Dining Restaurant",
  },
};

export const seoMeta: MetaValue = {
  key: "seo",
  title: "Cấu hình SEO trang chủ",
  description:
    "Cấu hình SEO metadata cho trang chủ (title, description, Open Graph)",
  fields: [
    {
      key: "title",
      type: "text",
      label: "Page Title",
      description:
        "Tiêu đề trang hiển thị trên tab trình duyệt và kết quả tìm kiếm",
      isRequired: true,
      placeholder: "TALO Kitchen & Lounge - Home",
    },
    {
      key: "description",
      type: "textarea",
      label: "Meta Description",
      description:
        "Mô tả trang hiển thị trên kết quả tìm kiếm Google (150-160 ký tự)",
      isRequired: true,
      placeholder: "Nhập mô tả trang...",
    },
    {
      key: "keywords",
      type: "array",
      label: "Keywords",
      description: "Từ khóa SEO cho trang",
      isEditableList: true,
      isRequired: false,
      itemType: {
        type: "object",
        fields: [
          {
            key: "keyword",
            type: "text",
            label: "Từ khóa",
            description: "Nhập từ khóa SEO",
            isRequired: true,
            placeholder: "Ví dụ: restaurant",
          },
        ],
      },
      newItem: {
        keyword: "",
      },
    },
    {
      key: "og_title",
      type: "text",
      label: "Open Graph Title",
      description: "Tiêu đề hiển thị khi chia sẻ lên Facebook/Meta",
      isRequired: true,
      placeholder: "TALO Kitchen & Lounge - Fine Dining Experience",
    },
    {
      key: "og_description",
      type: "textarea",
      label: "Open Graph Description",
      description: "Mô tả hiển thị khi chia sẻ lên Facebook/Meta",
      isRequired: true,
      placeholder: "Nhập mô tả...",
    },
    {
      key: "og_image",
      type: "image",
      label: "Open Graph Image",
      description: "Ảnh preview khi chia sẻ lên Facebook/Meta (1200x630px)",
      isRequired: true,
    },
  ],
};
