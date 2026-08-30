import React from "react";
import { getTranslations } from "next-intl/server";

export default async function Filter() {
    const t = await getTranslations("common");
    return <div>{t("filter")}</div>;
}
