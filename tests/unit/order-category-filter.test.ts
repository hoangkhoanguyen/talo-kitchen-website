import { test } from "node:test";
import assert from "node:assert/strict";
import { PgDialect } from "drizzle-orm/pg-core";
import { mapColumnsInSQLToAlias } from "drizzle-orm";
import { orders } from "../../src/db/schemas";
import {
  buildCategoryCondition,
  parseCategoryIds,
} from "../../src/lib/order-category-filter";

const dialect = new PgDialect();
const render = (ids: number[], includeDisabled: boolean) => {
  const cond = buildCategoryCondition(ids, includeDisabled, orders.id);
  return cond && dialect.sqlToQuery(cond);
};

test("parseCategoryIds: bỏ giá trị rác và trùng", () => {
  assert.deepEqual(parseCategoryIds("1,2,x,2,-3,0, 4"), [1, 2, 4]);
  assert.deepEqual(parseCategoryIds(""), []);
  assert.deepEqual(parseCategoryIds(null), []);
});

test("không chọn danh mục → không có điều kiện", () => {
  assert.equal(render([], false), undefined);
  assert.equal(render([], true), undefined);
});

test("tài khoản thường: chỉ khớp món đang bật (is_enabled)", () => {
  const q = render([1, 2], false)!;
  assert.match(q.sql, /exists/i);
  assert.match(q.sql, /oi\.is_enabled = true/);
  assert.deepEqual(q.params, [1, 2]);
});

test("talo_kitchen: khớp mọi món, không lọc is_enabled", () => {
  const q = render([1, 2], true)!;
  assert.match(q.sql, /exists/i);
  assert.doesNotMatch(q.sql, /is_enabled/);
});

// Regression: db.query.orders.findMany({ where }) đổi mọi Column trong where
// thành cột của bảng orders. Subquery không được chứa Column của bảng khác.
test("findMany alias: chỉ orders.id là cột có alias, phần còn lại giữ nguyên", () => {
  const cond = buildCategoryCondition([1], false, orders.id)!;
  const q = dialect.sqlToQuery(mapColumnsInSQLToAlias(cond, "orders"));
  assert.match(q.sql, /oi\.order_id = "orders"\."id"/);
  assert.doesNotMatch(q.sql, /"orders"\."(order_id|category_id|product_id)"/);
});
