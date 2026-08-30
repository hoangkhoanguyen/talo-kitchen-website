"use client";
import React from "react";
import { Button } from "../ui/button";
import { Link } from "@/i18n/navigation";
import { webRoutes } from "@/constants/route";
import Icon from "@/components/common/Icon";
import { useTranslations } from "next-intl";

const GoToMenuButton = () => {
  const t = useTranslations("common");

  return (
    <Button
      as={Link}
      href={webRoutes.menu("")}
      variant={"secondary1"}
      startIcon={<Icon icon="ph:fork-knife-fill" className="text-2xl" />}
      className="gap-1 flex-col text-web-background-1 text-web-button-mobile lg:text-web-button"
    >
      {t("menu")}
    </Button>
  );
};

export default GoToMenuButton;
