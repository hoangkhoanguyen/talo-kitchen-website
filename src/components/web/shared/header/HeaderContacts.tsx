import Icon from "@/components/common/Icon";
import React, { FC } from "react";

export const HeaderContacts: FC<{ phone: string; openHours: string }> = ({
  phone,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-4.5">
      <HeaderContactItem icon="ph:phone-light" content={phone} href={`tel:${phone.replace(/\s/g, "")}`} />
    </div>
  );
};

function HeaderContactItem({
  content,
  icon,
  href,
}: {
  icon: string;
  content: string;
  href?: string;
}) {
  return (
    <div className="flex items-center gap-0.5">
      <Icon icon={icon} className="text-web-secondary-1 h-4.5 w-4.5" />
      {href ? (
        <a
          href={href}
          className="text-web-caption-mobile lg:text-web-caption text-web-content-1"
        >
          {content}
        </a>
      ) : (
        <span className="text-web-caption-mobile lg:text-web-caption text-web-content-1">
          {content}
        </span>
      )}
    </div>
  );
}
