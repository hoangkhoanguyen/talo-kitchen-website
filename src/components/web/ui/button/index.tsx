import Icon from "@/components/common/Icon";
import { Button } from "./Button";
import { QuantityButtons } from "./QuantityButtons";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export * from "./Button";
export * from "./QuantityButtons";

export const Buttons = async () => {
  const t = await getTranslations("common");

  return (
    <div className="flex flex-col gap-2 items-start p-10 bg-white">
      <Button>{t("reserveTable")}</Button>
      <Button variant={"secondary1"}>{t("reserve")}</Button>
      <Button variant={"secondary2"}>{t("reserve")}</Button>
      <Button variant={"white"} startIcon={<Icon icon="ph:caret-left-bold" />}>
        {t("prev")}
      </Button>
      <Button
        disabled
        variant={"white"}
        startIcon={<Icon icon="ph:caret-left-bold" />}
      >
        {t("prev")}
      </Button>
      <Button variant={"white"} endIcon={<Icon icon="ph:caret-right-bold" />}>
        {t("next")}
      </Button>
      <div className="p-5 bg-gray-400">
        <Button as={Link} href={"/"} variant={"link"}>
          {t("home")}
        </Button>
      </div>
      <QuantityButtons quantity={1} onChangeQuantity={() => {}} />
    </div>
  );
};
