import { MetadataRoute } from "next";
import { getAllProducts } from "@/services/products";
import { getUIConfigsByKeyCached } from "@/services/cached";
import { APP_URL } from "@/constants/app";

// Force dynamic để không chạy lúc build (vì cần DB connection)
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = APP_URL;

  // Lấy tất cả sản phẩm để tạo dynamic URLs
  const products = await getAllProducts();

  const productUrls =
    products?.map((product) => ({
      url: `${baseUrl}/dish/${product.id}`,
      lastModified: product.updatedAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })) || [];

  // Lấy menu categories từ config
  const menuConfig = await getUIConfigsByKeyCached("menu_page");
  const categories =
    (menuConfig?.value as any)?.food_categories?.categories_to_show || [];

  // Thêm category "all" vào đầu danh sách
  const allCategories = [{ key: "all", label: "All" }, ...categories];

  const menuCategoryUrls = allCategories
    .filter((cat: any) => cat.key)
    .map((cat: any) => ({
      url: `${baseUrl}/menu/${cat.key}`,
      lastModified: menuConfig?.updatedAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...menuCategoryUrls,
    {
      url: `${baseUrl}/reservation`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...productUrls,
  ];
}
