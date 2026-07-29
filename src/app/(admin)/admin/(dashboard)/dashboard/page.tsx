import { adminRoutes } from "@/constants/route";
import { redirect } from "next/navigation";

const DashboardPage = () => {
  return redirect(adminRoutes.products());
};

export default DashboardPage;
