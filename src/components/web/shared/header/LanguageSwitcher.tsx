"use client";

import React from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  vi: "Tiếng Việt",
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSwitch = (nextLocale: string) => {
    if (nextLocale === locale) return;

    const query = searchParams.toString();
    const nextPath = query ? `${pathname}?${query}` : pathname;

    router.replace(nextPath, { locale: nextLocale });
  };

  return (
    <nav aria-label="Language">
      <div className="inline-flex items-center border border-web-content-3 bg-web-background-1 rounded overflow-hidden">
        {routing.locales.map((code, index) => {
          const isActive = code === locale;

          return (
            <button
              key={code}
              type="button"
              onClick={() => handleSwitch(code)}
              aria-label={LOCALE_NAMES[code] ?? code}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "px-2.5 py-1 text-web-label-mobile lg:text-web-label uppercase tracking-wide duration-200 focus-visible:outline-web-primary active:scale-95",
                index !== 0 && "border-l border-web-content-3",
                isActive
                  ? "bg-web-secondary-1 text-web-content-1"
                  : "text-web-content-2 hover:text-web-content-1 hover:bg-web-background-2",
              )}
            >
              {code.toUpperCase()}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
