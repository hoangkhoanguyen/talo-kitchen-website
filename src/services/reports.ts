import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db/drizzle";
import {
  orders,
  orderItems,
  productCategories,
  products,
} from "@/db/schemas";
import { groupPayments } from "@/constants/reports";
import type {
  ProductSalesReport,
  RevenueOrdersReport,
  RevenueReport,
} from "@/types/reports";
import {
  mapRevenueOrderRow,
  sortProductSales,
  summarizeProductSales,
  summarizeRevenueOrders,
  type RawRevenueOrderRow,
} from "@/lib/report-helpers";
import { daysBetweenInclusive } from "@/lib/date";

export { computeOrderRevenue } from "@/lib/report-revenue";

// Hằng cố định (không phải input) nên nhúng literal để tránh lỗi suy kiểu của bind param
const VN_TZ = sql.raw("'Asia/Ho_Chi_Minh'");

/**
 * CTE dùng chung cho mọi truy vấn báo cáo:
 * - item_off: tổng item đã tắt gộp theo order_id (không nhân bản dòng đơn)
 * - o: các đơn completed trong khoảng ngày VN, kèm doanh thu/ship đã làm tròn.
 * Tiền là real (float4) → cast ::float8::numeric (KHÔNG real::numeric).
 */
function buildOrdersCte(start: string, end: string, includeDisabled: boolean) {
  const enabledFilter = includeDisabled
    ? sql``
    : sql`AND ord.is_enabled = true`;
  const revenueExpr = includeDisabled
    ? sql`ROUND(ord.total_price::float8::numeric)`
    : sql`ROUND(ord.total_price::float8::numeric - COALESCE(io.off, 0))`;

  return sql`
    item_off AS (
      SELECT oi.order_id, SUM(oi.total_price::float8::numeric) AS off
      FROM ${orderItems} oi
      WHERE oi.is_enabled = false
      GROUP BY oi.order_id
    ),
    o AS (
      SELECT
        (ord.created_at AT TIME ZONE ${VN_TZ})::date AS d,
        ord.payment_method AS payment_method,
        ROUND(ord.shipping_fee::float8::numeric) AS ship,
        ${revenueExpr} AS revenue,
        ord.id AS id
      FROM ${orders} ord
      LEFT JOIN item_off io ON io.order_id = ord.id
      WHERE ord.status = 'completed'
        ${enabledFilter}
        AND ord.created_at >= ((${start}::date)::timestamp AT TIME ZONE ${VN_TZ})
        AND ord.created_at < (((${end}::date + 1))::timestamp AT TIME ZONE ${VN_TZ})
    )
  `;
}

type DailyRow = {
  date: string;
  order_count: string | number;
  ship: string | number;
  revenue: string | number;
};

type PaymentRow = {
  payment_method: string | null;
  order_count: string | number;
  ship: string | number;
  revenue: string | number;
};

/**
 * Nguồn số liệu duy nhất cho màn hình và Excel (RULE-18).
 * Chỉ trả số đã tổng hợp, không có isEnabled/danh sách đơn.
 */
export async function getRevenueReport({
  start,
  end,
  includeDisabled,
}: {
  start: string;
  end: string;
  includeDisabled: boolean;
}): Promise<RevenueReport> {
  const db = getDb();

  const dailyResult = await db.execute(sql`
    WITH ${buildOrdersCte(start, end, includeDisabled)}
    SELECT
      to_char(g.d, 'YYYY-MM-DD') AS date,
      COUNT(o.id) AS order_count,
      COALESCE(SUM(o.ship), 0)::bigint AS ship,
      COALESCE(SUM(o.revenue), 0)::bigint AS revenue
    FROM (
      SELECT generate_series(
        (${start}::date)::timestamp,
        (${end}::date)::timestamp,
        interval '1 day'
      )::date AS d
    ) g
    LEFT JOIN o ON o.d = g.d
    GROUP BY g.d
    ORDER BY g.d ASC
  `);

  const paymentResult = await db.execute(sql`
    WITH ${buildOrdersCte(start, end, includeDisabled)}
    SELECT
      TRIM(o.payment_method) AS payment_method,
      COUNT(o.id) AS order_count,
      COALESCE(SUM(o.ship), 0)::bigint AS ship,
      COALESCE(SUM(o.revenue), 0)::bigint AS revenue
    FROM o
    GROUP BY TRIM(o.payment_method)
  `);

  const daily = (Array.from(dailyResult) as unknown as DailyRow[]).map(
    (row) => ({
      date: row.date,
      orderCount: Number(row.order_count),
      shippingFee: Number(row.ship),
      revenue: Number(row.revenue),
    }),
  );

  const byPayment = groupPayments(
    (Array.from(paymentResult) as unknown as PaymentRow[]).map((row) => ({
      paymentMethod: row.payment_method,
      orderCount: Number(row.order_count),
      shippingFee: Number(row.ship),
      revenue: Number(row.revenue),
    })),
  );

  const summary = daily.reduce(
    (acc, day) => ({
      revenue: acc.revenue + day.revenue,
      orderCount: acc.orderCount + day.orderCount,
      shippingFee: acc.shippingFee + day.shippingFee,
    }),
    { revenue: 0, orderCount: 0, shippingFee: 0 },
  );

  return {
    range: { start, end, days: daysBetweenInclusive(start, end) },
    summary,
    daily,
    byPayment,
  };
}

/**
 * Danh sách đơn cho Excel "Theo đơn". Dùng lại buildOrdersCte → cùng tập đơn,
 * cùng doanh thu (đã trừ món tắt với tài khoản thường) như getRevenueReport.
 * is_enabled chỉ SELECT khi includeDisabled (talo_kitchen).
 */
export async function getRevenueOrders({
  start,
  end,
  includeDisabled,
}: {
  start: string;
  end: string;
  includeDisabled: boolean;
}): Promise<RevenueOrdersReport> {
  const db = getDb();
  const enabledColumn = includeDisabled
    ? sql`, ord.is_enabled AS is_enabled`
    : sql``;

  const result = await db.execute(sql`
    WITH ${buildOrdersCte(start, end, includeDisabled)}
    SELECT
      to_char(ord.created_at AT TIME ZONE ${VN_TZ}, 'YYYY-MM-DD HH24:MI') AS created_at_vn,
      ord.code AS code,
      ord.first_name AS first_name,
      ord.last_name AS last_name,
      ord.phone AS phone,
      ord.order_type_label AS order_type_label,
      o.payment_method AS payment_method,
      o.ship::bigint AS ship,
      o.revenue::bigint AS revenue,
      ord.internal_note AS internal_note
      ${enabledColumn}
    FROM o
    JOIN ${orders} ord ON ord.id = o.id
    ORDER BY ord.created_at ASC, ord.id ASC
  `);

  const rows = (Array.from(result) as unknown as RawRevenueOrderRow[]).map(
    (row) => mapRevenueOrderRow(row, includeDisabled),
  );

  return {
    range: { start, end, days: daysBetweenInclusive(start, end) },
    summary: summarizeRevenueOrders(rows),
    orders: rows,
  };
}

type ProductSalesDbRow = {
  product_id: string | number;
  name: string | null;
  category_name: string | null;
  quantity: string | number;
  order_count: string | number;
  revenue: string | number;
};

/**
 * Thống kê theo món trong cùng tập đơn với báo cáo doanh thu (buildOrdersCte).
 * - Tài khoản thường: không tính món tắt (đơn tắt đã bị loại trong CTE).
 * - Món đang bán chưa có lượt → 0; món ngừng bán chỉ hiện nếu có lượt.
 * - Món đã xoá khỏi products → tên snapshot, không danh mục; bị loại khi lọc danh mục.
 * - Lọc theo danh mục hiện tại của món.
 */
export async function getProductSalesReport({
  start,
  end,
  categoryId,
  includeDisabled,
}: {
  start: string;
  end: string;
  categoryId: number | null;
  includeDisabled: boolean;
}): Promise<ProductSalesReport> {
  const db = getDb();
  const itemFilter = includeDisabled ? sql`` : sql`AND oi.is_enabled = true`;
  const categoryFilter =
    categoryId === null ? sql`` : sql`WHERE p.category_id = ${categoryId}`;

  const result = await db.execute(sql`
    WITH ${buildOrdersCte(start, end, includeDisabled)},
    sold AS (
      SELECT
        oi.product_id AS product_id,
        MAX(oi.product_name) AS product_name,
        SUM(oi.quantity)::bigint AS quantity,
        COUNT(DISTINCT oi.order_id)::bigint AS order_count,
        ROUND(SUM(oi.total_price::float8::numeric))::bigint AS revenue
      FROM ${orderItems} oi
      JOIN o ON o.id = oi.order_id
      WHERE true ${itemFilter}
      GROUP BY oi.product_id
    ),
    k AS (
      SELECT product_id AS id FROM sold
      UNION
      SELECT ap.id FROM ${products} ap WHERE ap.is_active = true
    )
    SELECT
      k.id AS product_id,
      COALESCE(p.title, s.product_name) AS name,
      c.name AS category_name,
      COALESCE(s.quantity, 0) AS quantity,
      COALESCE(s.order_count, 0) AS order_count,
      COALESCE(s.revenue, 0) AS revenue
    FROM k
    LEFT JOIN sold s ON s.product_id = k.id
    LEFT JOIN ${products} p ON p.id = k.id
    LEFT JOIN ${productCategories} c ON c.id = p.category_id
    ${categoryFilter}
  `);

  let category: ProductSalesReport["category"] = null;
  if (categoryId !== null) {
    const found = await db
      .select({ name: productCategories.name })
      .from(productCategories)
      .where(eq(productCategories.id, categoryId))
      .limit(1);
    category = { id: categoryId, name: found[0]?.name ?? null };
  }

  const items = sortProductSales(
    (Array.from(result) as unknown as ProductSalesDbRow[]).map((row) => ({
      productId: Number(row.product_id),
      name: row.name ?? "",
      categoryName: row.category_name,
      quantity: Number(row.quantity),
      orderCount: Number(row.order_count),
      revenue: Number(row.revenue),
    })),
  );

  return {
    range: { start, end, days: daysBetweenInclusive(start, end) },
    category,
    summary: summarizeProductSales(items),
    items,
  };
}
