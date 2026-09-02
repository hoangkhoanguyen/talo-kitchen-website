import { ConfigValue } from "@/types/configs";
import { MetaValue } from "@/types/settings";

export const seoInitialValue: ConfigValue = {
  title: "Reservation | TALO Kitchen & Lounge",
  description:
    "Reserve your table at TALO Kitchen & Lounge. Experience fine dining with fresh ingredients and authentic flavors in a warm atmosphere.",
  keywords: [
    { keyword: "reservation" },
    { keyword: "book table" },
    { keyword: "restaurant booking" },
    { keyword: "TALO Kitchen & Lounge" },
  ],
  og_title: "Reserve Your Table | TALO Kitchen & Lounge",
  og_description:
    "Reserve your table at TALO Kitchen & Lounge. Experience fine dining with fresh ingredients and authentic flavors in a warm atmosphere.",
  og_image: {
    url: "/assets/static/reservation-og-image.jpg",
    alt: "Reserve Your Table at TALO Kitchen & Lounge",
  },
};

export const seoMeta: MetaValue = {
  key: "seo",
  title: "Cấu hình SEO trang Đặt bàn",
  description:
    "Cấu hình SEO metadata cho trang Đặt bàn (title, description, Open Graph)",
  fields: [
    {
      key: "title",
      type: "text",
      label: "Page Title",
      description:
        "Tiêu đề trang hiển thị trên tab trình duyệt và kết quả tìm kiếm",
      isRequired: true,
      placeholder: "Reservation | TALO Kitchen & Lounge",
      localized: true,
    },
    {
      key: "description",
      type: "textarea",
      label: "Meta Description",
      description:
        "Mô tả trang hiển thị trên kết quả tìm kiếm Google (150-160 ký tự)",
      isRequired: true,
      placeholder: "Nhập mô tả trang...",
      localized: true,
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
            placeholder: "Ví dụ: reservation",
            localized: true,
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
      placeholder: "Reserve Your Table | TALO Kitchen & Lounge",
      localized: true,
    },
    {
      key: "og_description",
      type: "textarea",
      label: "Open Graph Description",
      description: "Mô tả hiển thị khi chia sẻ lên Facebook/Meta",
      isRequired: true,
      placeholder: "Nhập mô tả...",
      localized: true,
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
