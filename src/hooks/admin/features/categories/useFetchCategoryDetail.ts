import { adminRoutes } from "@/constants/route";
import { ProductCategoryDB, ProductDB } from "@/types/products";
import adminApi from "@/lib/api/axios";
import { useQuery } from "@tanstack/react-query";

interface CategoryWithProducts extends ProductCategoryDB {
  products: ProductDB[];
}

interface CategoryDetailResponse {
  category: CategoryWithProducts;
}

const useFetchCategoryDetail = (id: number) => {
  return useQuery({
    queryKey: ["admin", "categories", id],
    queryFn: (): Promise<CategoryDetailResponse> =>
      adminApi.get(`${adminRoutes.categoriesApi()}/${id}`),
    enabled: !!id,
  });
};

export default useFetchCategoryDetail;
