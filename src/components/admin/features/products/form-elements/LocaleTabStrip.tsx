"use client";

import React, { FC } from "react";

const LOCALE_LABELS: Record<string, string> = {
  en: "Tiếng Anh",
  vi: "Tiếng Việt",
};

function getLocaleLabel(locale: string): string {
  return LOCALE_LABELS[locale] ?? locale.toUpperCase();
}

interface LocaleTabStripProps {
  locales: readonly string[];
  defaultLocale: string;
  activeLocale: string;
  onChange: (locale: string) => void;
  isMissing?: (locale: string) => boolean;
  onCopyFromDefault?: () => void;
  showCopy?: boolean;
  className?: string;
}

const LocaleTabStrip: FC<LocaleTabStripProps> = ({
  locales,
  defaultLocale,
  activeLocale,
  onChange,
  isMissing,
  onCopyFromDefault,
  showCopy,
  className,
}) => {
  const orderedLocales = [
    defaultLocale,
    ...locales.filter((locale) => locale !== defaultLocale),
  ];

  return (
    <div
      role="tablist"
      className={`tabs tabs-box tabs-xs${className ? ` ${className}` : ""}`}
    >
      {orderedLocales.map((locale) => {
        const isActive = locale === activeLocale;
        const isNonDefaultMissing =
          locale !== defaultLocale && isMissing?.(locale);

        return (
          <button
            key={locale}
            type="button"
            role="tab"
            className={`tab${isActive ? " tab-active" : ""}`}
            onClick={() => onChange(locale)}
          >
            {getLocaleLabel(locale)}
            {isNonDefaultMissing && (
              <span className="badge badge-warning badge-xs ml-1">
                Chưa dịch
              </span>
            )}
          </button>
        );
      })}

      {showCopy && (
        <button
          type="button"
          className="btn btn-ghost btn-xs text-primary"
          onClick={() => onCopyFromDefault?.()}
        >
          Copy từ English
        </button>
      )}
    </div>
  );
};

export default LocaleTabStrip;
