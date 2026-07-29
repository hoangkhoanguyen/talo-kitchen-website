import { useAdminConfigs } from "@/store";

const useIsSidebarOpen = () => {
  return useAdminConfigs((state) => state.isSidebarOpen);
};

export default useIsSidebarOpen;
