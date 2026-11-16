import { and, eq, inArray, sql, type SQL } from "drizzle-orm";
import type { AnyColumn } from "drizzle-orm";
import { orderItems, products } from "@/db/schemas";

/** "1,2,x,3" -> [1,2,3] (bỏ giá trị không phải số nguyên dương, bỏ trùng). */
export function parseCategoryIds(raw: string | null | undefined): number[] {
  if (!raw) return [];
  const ids = raw
    .split(",")
    .map((v) => Number(v.trim()))
    .filter((n) => Number.isInteger(n) && n > 0);
  return Array.from(new Set(ids));
}

/**
 * Điều kiện: đơn có ít nhất 1 món thuộc một trong các danh mục đã chọn.
 * Cờ is_enabled: tài khoản thường (includeDisabled=false) chỉ khớp trên món
 * đang BẬT, để kết quả không lộ ra sự tồn tại của món bị tắt.
 * talo_kitchen (includeDisabled=true) khớp trên mọi món.
 * Dùng EXISTS để không nhân bản dòng → phân trang và count vẫn đúng.
 */
export function buildCategoryCondition(
  categoryIds: number[],
  includeDisabled: boolean,
  orderIdCol: AnyColumn,
): SQL | undefined {
  if (!categoryIds.length) return undefined;

  const itemConditions = and(
    eq(orderItems.orderId, orderIdCol),
    inArray(products.categoryId, categoryIds),
    includeDisabled ? undefined : eq(orderItems.isEnabled, true),
  );

  return sql`EXISTS (SELECT 1 FROM ${orderItems} INNER JOIN ${products} ON ${products.id} = ${orderItems.productId} WHERE ${itemConditions})`;
}
