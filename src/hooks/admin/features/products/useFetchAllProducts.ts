import { adminRoutes } from "@/constants/route";
import adminApi from "@/lib/api/axios";
import { ProductDB } from "@/types/products";
import { useQuery } from "@tanstack/react-query";

const useFetchAllProducts = () => {
  return useQuery({
    queryKey: ["products", "all"],
    queryFn: (): Promise<{
      allProducts: Pick<ProductDB, "id" | "title" | "isActive">[];
    }> => adminApi.get(adminRoutes.allProductsApi()),
    select(data) {
      return data.allProducts;
    },
    staleTime: 30 * 60000,
  });
};

export default useFetchAllProducts;
