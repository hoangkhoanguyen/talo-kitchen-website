import { adminRoutes } from "@/constants/route";
import adminApi from "@/lib/api/axios";
import { useMutation } from "@tanstack/react-query";

const useUploadImage = () => {
  return useMutation({
    mutationFn: (file: File): Promise<{ url: string }> => {
      const formData = new FormData();
      formData.append("file", file);
      return adminApi.post(adminRoutes.imagesApi(), formData);
    },
  });
};

export default useUploadImage;
