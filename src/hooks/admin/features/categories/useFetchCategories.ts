import { adminRoutes } from "@/constants/route";
import { ProductCategoryDB } from "@/types/products";
import adminApi from "@/lib/api/axios";
import { useQuery } from "@tanstack/react-query";

interface CategoriesResponse {
  categories: ProductCategoryDB[];
  total: number;
  page: number;
  limit: number;
}

interface CategoriesParams {
  page: number;
  limit: number;
  search: string;
  isActive: boolean | null;
}

const useFetchCategories = (query: CategoriesParams) => {
  return useQuery({
    queryKey: ["admin", "categories", query],
    queryFn: (): Promise<CategoriesResponse> =>
      adminApi.get(adminRoutes.categoriesApi(query)),
  });
};

export default useFetchCategories;
