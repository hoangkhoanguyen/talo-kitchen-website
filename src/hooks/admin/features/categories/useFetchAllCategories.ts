import { adminRoutes } from "@/constants/route";
import adminApi from "@/lib/api/axios";
import { ProductCategoryDB } from "@/types/products";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type Response = { categories: ProductCategoryDB[] };

const useFetchAllCategories = () => {
  return useQuery({
    queryKey: ["category"],
    queryFn: (): Promise<Response> => adminApi.get(adminRoutes.categoriesApi()),
    select(data) {
      return data.categories;
    },
    staleTime: 30 * 60000,
  });
};

export default useFetchAllCategories;

export const useCategorySuccess = () => {
  const queryClient = useQueryClient();

  const onAddSuccess = (data: ProductCategoryDB) => {
    queryClient.setQueryData(
      ["category"],
      (p: Response | undefined) =>
        p && {
          ...p,
          categories: [data, ...p.categories],
        },
    );
  };

  return { onAddSuccess };
};
