"use client";

import Link from "next/link";
import React, { FC } from "react";
import CartButton from "./CartButton";
import MobileMenuButton from "./MobileMenuButton";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface IMenuItem {
  href: string;
  label: string;
  title: string;
}

const DesktopMenu: FC<{ menus: IMenuItem[] }> = ({ menus }) => {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2 lg:gap-10">
      <nav aria-label="Site navigation" className="hidden lg:block">
        <ul className="flex items-center gap-10">
          {menus.map((menu) => (
            <li key={menu.label}>
              <MenuItem {...menu} pathname={pathname} />
            </li>
          ))}
        </ul>
      </nav>
      <MobileMenuButton />
      <CartButton />
    </div>
  );
};

export default DesktopMenu;

function MenuItem({
  href,
  label,
  title,
  pathname,
}: IMenuItem & {
  pathname: string;
}) {
  const isActive =
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      title={title}
      className={cn(
        "text-web-subtitle text-web-content-1 hover:text-web-secondary-1 duration-200",
        {
          "text-web-secondary-1": isActive,
        },
      )}
    >
      {label}
    </Link>
  );
}
