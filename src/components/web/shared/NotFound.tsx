import React from "react";
import { Button } from "../ui/button";
import { Link } from "@/i18n/navigation";
import { webRoutes } from "@/constants/route";
import { getTranslations } from "next-intl/server";

const NotFound = async () => {
  const t = await getTranslations("common");

  return (
    <div className="container pt-20 pb-10 flex flex-col md:items-center justify-center h-full">
      <p className="text-web-primary text-web-h2-mobile lg:text-web-h2 mb-5">
        {t("oops")}
      </p>
      <p className="text-web-content-1 text-web-subtitle-mobile lg:text-web-subtitle mb-10">
        {t("notFoundGenericMessage")}
      </p>
      <Button
        as={Link}
        href={webRoutes.home()}
        className="text-web-button-mobile lg:text-web-button py-4.5 w-full lg:max-w-80"
      >
        {t("backToHome")}
      </Button>
    </div>
  );
};

export default NotFound;
