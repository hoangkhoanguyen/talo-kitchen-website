/**
 * Cached Config Services
 *
 * Services này được cache để phục vụ user-facing pages
 * Admin services KHÔNG cache, luôn fetch real-time
 */

import { CACHE_TAGS } from "@/constants/cache";
import { createDynamicCachedFunction } from "@/lib/cache";
import { getConfigsByKey } from "@/services/configs";

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
 * ✅ CACHED: Get UI config by key
 * Wrapper cho getConfigsByKey với type="ui"
 */
export const getUIConfigsByKeyCached = (key: string) =>
  getConfigsByKeyCached(key, "ui");

/**
 * ✅ CACHED: Get App config by key
 * Wrapper cho getConfigsByKey với type="app"
 */
export const getAppConfigsByKeyCached = (key: string) =>
  getConfigsByKeyCached(key, "app");
