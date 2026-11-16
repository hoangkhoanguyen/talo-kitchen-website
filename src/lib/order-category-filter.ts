import { sql, type SQL } from "drizzle-orm";
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

  // KHÔNG dùng Column object của order_items/products ở đây: với
  // db.query.orders.findMany({ where }), drizzle đổi MỌI Column trong where
  // thành cột của bảng orders (mapColumnsInSQLToAlias) → SQL lỗi. Dùng alias + tên cột thô.
  // Chỉ orderIdCol (cột của orders) được để là Column.
  const ids = sql.join(
    categoryIds.map((id) => sql`${id}`),
    sql`, `,
  );
  const enabledOnly = includeDisabled ? sql`` : sql` AND oi.is_enabled = true`;

  return sql`EXISTS (SELECT 1 FROM ${orderItems} oi INNER JOIN ${products} p ON p.id = oi.product_id WHERE oi.order_id = ${orderIdCol} AND p.category_id IN (${ids})${enabledOnly})`;
}
