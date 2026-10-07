import Icon from "@/components/common/Icon";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React, { FC } from "react";

export interface IMenuItem {
  label: string;
  icon?: string;
  activeIcon?: string;
  href?: string;
  type: "link" | "collapse";
  children?: IMenuItem[];
}

export const MenuItem: FC<
  IMenuItem & { pathname: string; highlight?: boolean }
> = ({ type, highlight = false, ...rest }) => {
  const { label, icon, activeIcon, href, pathname, children = [] } = rest;
  const isActive = pathname.startsWith(href || "");
  const hoverBg = highlight ? "hover:bg-red-700" : "hover:bg-slate-600";
  const activeBg = highlight ? "bg-red-950" : "bg-slate-800";

  if (type === "link") {
    return (
      <Link
        href={href!}
        className={cn(
          "flex items-center rounded-xl duration-200 gap-3 py-2.5 px-4",
          hoverBg,
          isActive ? activeBg : "",
        )}
      >
        {icon && (
          <Icon
            className={cn("text-xl text-white")}
            icon={isActive ? activeIcon! : icon}
          />
        )}
        <span
          className={cn("text-sm font-medium duration-200 truncate text-white")}
        >
          {label}
        </span>
      </Link>
    );
  }

  return (
    <details>
      <summary
        className={cn(
          "flex-1 flex items-center gap-3 w-full py-2.5 px-4 cursor-pointer duration-200 rounded-xl",
          hoverBg,
        )}
      >
        {icon && (
          <Icon
            className={cn("text-xl text-white")}
            icon={isActive ? activeIcon! : icon}
          />
        )}
        <span
          className={cn("text-sm font-medium duration-200 truncate text-white")}
        >
          {label}
        </span>
      </summary>

      <div className="ps-8 py-2 flex flex-col items-stretch gap-2">
        {children.map((child, index) => (
          <MenuItem
            key={index}
            {...child}
            pathname={pathname}
            highlight={highlight}
          />
        ))}
      </div>
    </details>
  );
};
