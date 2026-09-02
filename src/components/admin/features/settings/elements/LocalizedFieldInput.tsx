"use client";

import React, { FC, useState } from "react";
import { Control, Controller } from "react-hook-form";
import { InputWithLabel } from "@/components/admin/ui/form";
import SettingsTextInput from "./SettingsTextInput";
import SettingsTextareaInput from "./SettingsTextareaInput";
import { normalizeLocalized } from "@/lib/localized-config";
import { routing } from "@/i18n/routing";
import type { Locale, LocalizedText } from "@/types/configs";

const LOCALE_LABELS: Record<string, string> = {
  en: "Tiếng Anh",
  vi: "Tiếng Việt",
};

function getLocaleLabel(locale: string): string {
  return LOCALE_LABELS[locale] ?? locale.toUpperCase();
}

// defaultLocale first, keep the rest in their existing order
const orderedLocales: Locale[] = [
  routing.defaultLocale as Locale,
  ...routing.locales.filter((l) => l !== routing.defaultLocale),
];

interface LocalizedFieldInputProps {
  control: Control<any>;
  name: string;
  variant: "text" | "textarea";
  label?: string;
  withLabel?: boolean;
  isRequired?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

const LocalizedFieldInput: FC<LocalizedFieldInputProps> = ({
  control,
  name,
  variant,
  label,
  withLabel,
  isRequired,
  placeholder,
  disabled,
}) => {
  const [activeLocale, setActiveLocale] = useState<Locale>(
    routing.defaultLocale as Locale
  );

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const normalizedValue: LocalizedText = normalizeLocalized(value);

        const handleLocaleChange = (locale: Locale, v: string) => {
          onChange({ ...normalizedValue, [locale]: v });
        };

        const errorMessage: string | undefined =
          (error as any)?.[activeLocale]?.message ?? error?.message;

        const activeValue = normalizedValue[activeLocale] ?? "";
        const defaultLocaleValue =
          normalizedValue[routing.defaultLocale as Locale] ?? "";
        const showCopyButton =
          activeLocale !== routing.defaultLocale && activeValue === "";

        const content = (
          <div className="w-full">
            <div role="tablist" className="tabs tabs-box tabs-xs mb-2">
              {orderedLocales.map((locale) => {
                const isActive = locale === activeLocale;
                const isEmpty = !(normalizedValue[locale] ?? "");
                const isNonDefaultEmpty =
                  locale !== routing.defaultLocale && isEmpty;
                return (
                  <button
                    key={locale}
                    type="button"
                    role="tab"
                    className={`tab${isActive ? " tab-active" : ""}`}
                    onClick={() => setActiveLocale(locale)}
                  >
                    {getLocaleLabel(locale)}
                    {isNonDefaultEmpty && (
                      <span className="badge badge-warning badge-xs ml-1">
                        Chưa dịch
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {variant === "text" ? (
              <SettingsTextInput
                value={activeValue}
                onChange={(v) => handleLocaleChange(activeLocale, v)}
                errorMessage={errorMessage}
                placeholder={placeholder}
                disabled={disabled}
              />
            ) : (
              <SettingsTextareaInput
                value={activeValue}
                onChange={(v) => handleLocaleChange(activeLocale, v)}
                errorMessage={errorMessage}
                placeholder={placeholder}
                disabled={disabled}
              />
            )}

            {showCopyButton && (
              <button
                type="button"
                className="btn btn-ghost btn-xs text-primary"
                onClick={() =>
                  handleLocaleChange(activeLocale, defaultLocaleValue)
                }
              >
                Copy từ English
              </button>
            )}
          </div>
        );

        return withLabel ? (
          <InputWithLabel label={label ?? ""} required={isRequired}>
            {content}
          </InputWithLabel>
        ) : (
          content
        );
      }}
    />
  );
};

export default LocalizedFieldInput;
