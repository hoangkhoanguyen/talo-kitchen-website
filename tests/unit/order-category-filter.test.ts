import { test } from "node:test";
import assert from "node:assert/strict";
import { PgDialect } from "drizzle-orm/pg-core";
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
  assert.match(q.sql, /"is_enabled" = \$/);
  assert.deepEqual(q.params.filter((p) => typeof p === "number"), [1, 2]);
  assert.ok(q.params.includes(true));
});

test("talo_kitchen: khớp mọi món, không lọc is_enabled", () => {
  const q = render([1, 2], true)!;
  assert.match(q.sql, /exists/i);
  assert.doesNotMatch(q.sql, /"is_enabled"/);
});
