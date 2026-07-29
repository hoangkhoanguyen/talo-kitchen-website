import { ConfigValue } from "@/types/configs";
import { MetaValue } from "@/types/settings";

export const seoInitialValue: ConfigValue = {
  title: "Menu | TALO Kitchen & Lounge",
  description:
    "Explore our delicious menu at TALO Kitchen & Lounge. Fresh ingredients, authentic flavors.",
  keywords: [
    { keyword: "menu" },
    { keyword: "restaurant menu" },
    { keyword: "food" },
    { keyword: "TALO Kitchen & Lounge" },
  ],
  og_title: "Our Menu | TALO Kitchen & Lounge",
  og_description:
    "Explore our delicious menu at TALO Kitchen & Lounge. Fresh ingredients, authentic flavors.",
  og_image: {
    url: "/assets/static/menu-og-image.jpg",
    alt: "TALO Kitchen & Lounge Menu",
  },
};

export const seoMeta: MetaValue = {
  key: "seo",
  title: "Cấu hình SEO trang Menu",
  description:
    "Cấu hình SEO metadata cho trang Menu (title, description, Open Graph)",
  fields: [
    {
      key: "title",
      type: "text",
      label: "Page Title",
      description:
        "Tiêu đề trang hiển thị trên tab trình duyệt và kết quả tìm kiếm",
      isRequired: true,
      placeholder: "Menu | TALO Kitchen & Lounge",
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
            placeholder: "Ví dụ: menu",
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
      placeholder: "Our Menu | TALO Kitchen & Lounge",
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
