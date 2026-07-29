import { unstable_cache } from "next/cache";

/**
 * Cache Helper Functions
 *
 * QUY ƯỚC:
 * - Chỉ cache user-facing services
 * - Admin services không cache
 * - Cart validation không cache
 */

/**
 * Cache duration constants in seconds
 */
export const CACHE_DURATIONS = {
  REALTIME: 30, // 30 seconds - for frequently changing data
  SHORT: 300, // 5 minutes - for data that changes regularly
  MEDIUM: 900, // 15 minutes - for data that changes occasionally
  LONG: 3600, // 1 hour - for relatively stable data
  STATIC: 86400, // 24 hours - for rarely changing data
  DEFAULT: false, // No auto-revalidate - chỉ revalidate thủ công qua tags
} as const;

/**
 * Tạo cached function với key tĩnh
 * @param fn - Function cần cache
 * @param keyParts - Các phần tạo thành cache key
 * @param tags - Cache tags để revalidate
 * @param revalidate - Thời gian revalidate (giây), mặc định không tự động revalidate
 */
export function createCachedFunction<
  T extends (...args: any[]) => Promise<any>,
>(
  fn: T,
  keyParts: string[],
  tags: string[],
  revalidate: number | false = CACHE_DURATIONS.DEFAULT,
): T {
  return unstable_cache(fn, keyParts, {
    tags,
    revalidate,
  }) as T;
}

/**
 * Tạo cached function với key động dựa vào parameters
 * @param fn - Function cần cache
 * @param getKeyParts - Function tạo cache key từ params
 * @param getTags - Function tạo cache tags từ params
 * @param revalidate - Thời gian revalidate (giây), mặc định không tự động revalidate
 */
export function createDynamicCachedFunction<
  TArgs extends any[],
  TReturn,
  TFn extends (...args: TArgs) => Promise<TReturn>,
>(
  fn: TFn,
  getKeyParts: (...args: TArgs) => string[],
  getTags: (...args: TArgs) => string[],
  revalidate: number | false = CACHE_DURATIONS.DEFAULT,
): TFn {
  return ((...args: TArgs) => {
    const keyParts = getKeyParts(...args);
    const tags = getTags(...args);

    return unstable_cache(fn, keyParts, {
      tags,
      revalidate,
    })(...args);
  }) as TFn;
}
