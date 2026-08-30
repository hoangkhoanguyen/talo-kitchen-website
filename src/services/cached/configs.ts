/**
 * Cached Config Services
 *
 * Services này được cache để phục vụ user-facing pages
 * Admin services KHÔNG cache, luôn fetch real-time
 */

import { CACHE_TAGS } from "@/constants/cache";
import { createDynamicCachedFunction } from "@/lib/cache";
import { resolveConfig } from "@/lib/localized-config";
import { getConfigsByKey } from "@/services/configs";
import { uiMeta } from "@/constants/settings/ui";
import type { Locale } from "@/types/configs";

/**
 * ✅ CACHED: Get config by key
 * Dùng cho: Website configs (navigation, theme, settings, etc.)
 */
export const getConfigsByKeyCached = createDynamicCachedFunction(
  getConfigsByKey,
  (key: string, configType: string) => ["configs", configType, key],
  (key: string) => [CACHE_TAGS.CONFIGS.BY_KEY(key)],
);

/**
 * ✅ CACHED: Get UI config by key, resolved theo locale
 * Wrapper cho getConfigsByKeyCached với type="ui", resolve localized fields
 * trong value theo locale truyền vào. Cache key bao gồm locale, nhưng tag
 * revalidate KHÔNG scope theo locale (RULE-09) để 1 lần revalidate xoá cache
 * của mọi locale cho key đó.
 */
async function fetchUIConfigsByKeyResolved(key: string, locale: Locale) {
  const config = await getConfigsByKeyCached(key, "ui");

  if (!config) {
    return config;
  }

  const resolvedValue = resolveConfig(config.value, uiMeta[key] ?? [], locale);

  return { ...config, value: resolvedValue };
}

export const getUIConfigsByKeyCached = createDynamicCachedFunction(
  fetchUIConfigsByKeyResolved,
  (key: string, locale: Locale) => ["configs", "ui", key, locale],
  (key: string) => [CACHE_TAGS.CONFIGS.BY_KEY(key)],
);

/**
 * ✅ CACHED: Get App config by key
 * Wrapper cho getConfigsByKey với type="app"
 */
export const getAppConfigsByKeyCached = (key: string) =>
  getConfigsByKeyCached(key, "app");
