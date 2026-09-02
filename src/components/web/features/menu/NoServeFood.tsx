import React from "react";
import { getTranslations } from "next-intl/server";

const NoServeFood = async () => {
  const t = await getTranslations("menu");
  return <div>{t("noServeFood")}</div>;
};

export default NoServeFood;
