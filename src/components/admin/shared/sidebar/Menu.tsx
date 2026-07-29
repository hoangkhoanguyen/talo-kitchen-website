"use client";
import { usePathname } from "next/navigation";
import React from "react";
import { IMenuItem, MenuItem } from "./MenuItem";
import { cn } from "@/lib/utils";
import { adminRoutes } from "@/constants/route";

const menuItems: IMenuItem[] = [
  // { label: "Dashboard", href: "/admin", icon: "dashboard" },
  {
    label: "Products",
    href: adminRoutes.products(),
    icon: "famicons:fast-food-outline",
    activeIcon: "famicons:fast-food",
    type: "link",
  },
  {
    label: "Categories",
    href: adminRoutes.categories(),
    icon: "material-symbols:category-outline",
    activeIcon: "material-symbols:category",
    type: "link",
  },
  {
    label: "Orders",
    href: adminRoutes.orders(),
    icon: "bx:food-menu",
    activeIcon: "bxs:food-menu",
    type: "link",
  },
  {
    label: "Reservations",
    href: adminRoutes.reservations(),
    icon: "material-symbols:food-bank-outline-rounded",
    activeIcon: "material-symbols:food-bank-rounded",
    type: "link",
  },
  {
    label: "Cài đặt",
    icon: "material-symbols:settings-outline-rounded",
    activeIcon: "material-symbols:settings-rounded",
    type: "collapse",
    children: [
      {
        label: "Giao diện",
        href: adminRoutes.settings("ui"),
        type: "link",
      },
      {
        label: "Ứng dụng",
        href: adminRoutes.settings("app"),
        type: "link",
      },
    ],
  },
];

export const Menu = () => {
  const pathname = usePathname();

  return (
    <div className={cn("pt-7 flex flex-col gap-2 px-4")}>
      {menuItems.map((item, index) => (
        <MenuItem key={index} pathname={pathname} {...item} />
      ))}
    </div>
  );
};
