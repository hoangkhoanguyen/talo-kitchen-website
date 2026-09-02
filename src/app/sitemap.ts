import { MetadataRoute } from "next";
import { getAllProducts } from "@/services/products";
import { getUIConfigsByKeyCached } from "@/services/cached";
import { APP_URL } from "@/constants/app";
import { routing } from "@/i18n/routing";
import { buildSitemapLanguages } from "@/lib/i18n-meta";

// Force dynamic để không chạy lúc build (vì cần DB connection)
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = APP_URL;

  // Lấy tất cả sản phẩm để tạo dynamic URLs
  const products = await getAllProducts();

  const productUrls =
    products
      ?.filter((product) => product.slug)
      .map((product) => ({
        url: `${baseUrl}/dish/${product.slug}`,
        lastModified: product.updatedAt || new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
        alternates: {
          languages: buildSitemapLanguages(`/dish/${product.slug}`),
        },
      })) || [];

  // Lấy menu categories từ config
  const menuConfig = await getUIConfigsByKeyCached(
    "menu_page",
    routing.defaultLocale,
  );
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
      alternates: {
        languages: buildSitemapLanguages(`/menu/${cat.key}`),
      },
    }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
      alternates: { languages: buildSitemapLanguages("") },
    },
    ...menuCategoryUrls,
    {
      url: `${baseUrl}/reservation`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: { languages: buildSitemapLanguages("/reservation") },
    },
    ...productUrls,
  ];
}
