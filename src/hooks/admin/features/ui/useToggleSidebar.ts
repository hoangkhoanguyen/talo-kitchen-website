import { useAdminConfigs } from "@/store";

const useToggleSidebar = () => {
  return useAdminConfigs((state) => state.toggleSidebar);
};

export default useToggleSidebar;
