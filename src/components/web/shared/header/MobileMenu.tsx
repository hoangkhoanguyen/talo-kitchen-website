"use client";
import { useMobileMenu } from "@/hooks/web/ui/mobile-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { FC, useEffect } from "react";

const MobileMenu: FC<{ menu: any[] }> = ({ menu }) => {
  const isOpen = useMobileMenu((state) => state.isOpen);
  const onClose = useMobileMenu((state) => state.onClose);

  const pathname = usePathname();

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const header = document.querySelector("header");

      if (header && !header.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mouseup", handleClickOutside);

    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  return (
    <>
      <div
        className={cn(
          "bg-white lg:hidden rounded-es-lg rounded-ee-lg overflow-hidden transition-all duration-300",
          isOpen ? "h-auto" : "h-0",
        )}
      >
        <div className="py-10 px-3 ">
          <nav>
            <ul className="flex flex-col gap-10 items-stretch">
              {menu.map((m) => {
                const isActive =
                  pathname === m.href ||
                  (m.href !== "/" && pathname.startsWith(m.href));
                return (
                  <li key={m.label} className="">
                    <Link
                      href={m.href}
                      title={m.title}
                      onClick={onClose}
                      className={cn(
                        "text-web-subtitle-mobile lg:text-web-subtitle text-web-content-1 block w-full active:scale-95 duration-200",
                        {
                          "text-web-secondary-1": isActive,
                        },
                      )}
                    >
                      {m.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
