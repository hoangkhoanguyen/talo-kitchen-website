import clsx from "clsx";
import { ClassValue } from "clsx";
import { createTailwindMerge, getDefaultConfig } from "tailwind-merge";

// Tạo 1 instance twm duy nhất ở module scope theo docs createTailwindMerge
const twm = createTailwindMerge(() => {
  const defaultConfig = getDefaultConfig();
  return {
    ...defaultConfig,
    // Thêm 2 nhóm riêng cho 2 class custom để tailwind-merge không coi là cùng nhóm
    classGroups: {
      ...defaultConfig.classGroups,
      "font-style-web": [
        {
          "text-web": [
            "h1",
            "h1-mobile",
            "h2",
            "h2-mobile",
            "h3",
            "h3-mobile",
            "h4",
            "h4-mobile",
            "subtitle",
            "subtitle-mobile",
            "body",
            "body-mobile",
            "caption",
            "caption-mobile",
            "button",
            "button-mobile",
            "label",
            "label-mobile",
          ],
        },
      ],
      "color-web": [
        {
          "text-web": [
            "background-1",
            "background-2",
            "background-3",
            "primary",
            "secondary-1",
            "secondary-2",
            "secondary-3",
            "content-1",
            "content-2",
            "content-3",
            "success",
            "warning",
            "error",
          ],
        },
      ],
    },
    // Đảm bảo 2 nhóm custom không xung đột với nhau hoặc với các nhóm mặc định
    conflictingClassGroups: {
      ...defaultConfig.conflictingClassGroups,
      "font-style-web": [],
      "color-web": [],
    },
    cacheSize: 0,
  };
});

// Dùng instance twm thay vì twMerge mặc định
export const cn = (...args: ClassValue[]) => twm(clsx(args));

export function getErrorCode(error: Error) {
  try {
    const errObj: { code: number; message: string } = JSON.parse(error.message);
    return errObj.code;
  } catch {
    return undefined;
  }
}

export function generateSlug(title: string) {
  if (!title) return "";

  // 1. Chuyển chữ hoa thành chữ thường
  let slug = title.toLowerCase();

  // 2. Loại bỏ dấu tiếng Việt
  slug = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 3. Thay khoảng trắng và ký tự đặc biệt bằng dấu -
  slug = slug.replace(/[^a-z0-9]+/g, "-");

  // 4. Loại bỏ dấu - thừa ở đầu và cuối
  slug = slug.replace(/^-+|-+$/g, "");

  return slug;
}

export function formatCurrency(
  amount: number,
  locale = "vi-VN",
  currency = "VND",
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

export function splitTextByNewLine(text: string) {
  return text.split(/\r?\n/);
}

export function formatCurrencyWebsite(amount: number) {
  return `${amount.toLocaleString("vi-VN")} VND`;
}
