import { adminRoutes } from "@/constants/route";
import adminApi from "@/lib/api/axios";
import { useQuery } from "@tanstack/react-query";

const useFetchImages = () => {
  return useQuery({
    queryKey: ["uploaded-images"],
    queryFn: (): Promise<{ images: string[] }> =>
      adminApi.get(adminRoutes.imagesApi()),
    select(data) {
      return data.images;
    },
  });
};

export default useFetchImages;
