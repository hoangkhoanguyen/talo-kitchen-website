import { sql } from "drizzle-orm";
import { getDb } from "@/db/drizzle";
import { orders, orderItems } from "@/db/schemas";
import { groupPayments } from "@/constants/reports";
import type { RevenueReport } from "@/types/reports";
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
