import { adminRoutes } from "@/constants/route";
import { redirect } from "next/navigation";

const page = () => {
  return redirect(adminRoutes.dashboard());
};

export default page;
