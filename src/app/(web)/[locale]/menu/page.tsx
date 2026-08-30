import { webRoutes } from "@/constants/route";
import { redirect } from "next/navigation";

const page = () => {
  redirect(webRoutes.menu("all"));
};

export default page;
