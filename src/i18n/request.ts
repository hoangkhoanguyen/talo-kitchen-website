import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

type Messages = Record<string, unknown>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

/**
 * Deep-merge `override` on top of `base`. Nested namespace objects are
 * merged key by key so a locale file missing a key inside a nested
 * namespace still falls back to the English value for that key
 * (EC-06 / RULE-08), instead of losing the whole namespace.
 */
function deepMerge<T extends Messages>(base: T, override: Partial<T>): T {
  const result: Messages = { ...base };

  for (const key of Object.keys(override)) {
    const baseValue = result[key];
    const overrideValue = override[key];

    if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
      result[key] = deepMerge(baseValue, overrideValue);
    } else if (overrideValue !== undefined) {
      result[key] = overrideValue;
    }
  }

  return result as T;
}

async function loadMessages(locale: string): Promise<Messages> {
  try {
    const messages = (await import(`../../messages/${locale}.json`)).default;
    return messages as Messages;
  } catch {
    return {};
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = routing.locales.includes(
    requested as (typeof routing.locales)[number]
  )
    ? (requested as string)
    : routing.defaultLocale;

  const englishMessages = await loadMessages(routing.defaultLocale);
  const localeMessages =
    locale === routing.defaultLocale
      ? englishMessages
      : await loadMessages(locale);

  const messages = deepMerge(englishMessages, localeMessages);

  return {
    locale,
    messages,
  };
});
