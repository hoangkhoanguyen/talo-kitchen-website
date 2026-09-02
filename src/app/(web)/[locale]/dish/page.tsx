import { webRoutes } from "@/constants/route";
import { redirect } from "@/i18n/navigation";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const page = async ({ params }: PageProps) => {
  const { locale } = await params;

  redirect({ href: webRoutes.menu("all"), locale });
};

export default page;
