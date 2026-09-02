import React from "react";
import { getTranslations } from "next-intl/server";

const ReservationSuccess = async () => {
  const t = await getTranslations("reservation");
  return <div>{t("success.title")}</div>;
};

export default ReservationSuccess;
