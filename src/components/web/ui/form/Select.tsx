import React from "react";
import { getTranslations } from "next-intl/server";

export const Select = async () => {
    const t = await getTranslations("common");
    return <div>{t("select")}</div>;
};
