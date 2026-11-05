/**
 * Test xử lý 401 / refresh token phía client (src/lib/api/auth-refresh.ts).
 * Chạy: npx tsx --test tests/unit/auth-refresh.test.ts
 */
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  handleAuthError,
  __resetAuthRefreshState,
  type AuthErrorInfo,
} from "../../src/lib/api/auth-refresh";

const expired: AuthErrorInfo = {
  status: 401,
  code: 2,
  isRefreshRequest: false,
  isRetry: false,
};

/** đợi tối đa `ms`; trả "timeout" nếu promise chưa xong (phát hiện treo) */
function within<T>(p: Promise<T>, ms = 200) {
  return Promise.race([
    p,
    new Promise<"timeout">((r) => setTimeout(() => r("timeout"), ms)),
  ]);
}

const authRejected = () =>
  Promise.reject({ response: { status: 401, data: { code: 1 } } });

beforeEach(() => __resetAuthRefreshState());

test("không phải 401 → không xử lý", async () => {
  const out = await handleAuthError(
    { ...expired, status: 500 },
    { refresh: async () => {}, retry: async () => "x", logout: () => {} },
  );
  assert.deepEqual(out, { handled: false });
});

test("access token hết hạn → refresh rồi retry request", async () => {
  let refreshed = 0;
  const out = await handleAuthError(expired, {
    refresh: async () => void refreshed++,
    retry: async () => "data",
    logout: () => assert.fail("không được logout"),
  });
  assert.deepEqual(out, { handled: true, result: "data" });
  assert.equal(refreshed, 1);
});

test("nhiều request 401 cùng lúc chỉ refresh 1 lần", async () => {
  let refreshed = 0;
  const deps = {
    refresh: () =>
      new Promise<void>((r) => setTimeout(() => (refreshed++, r()), 20)),
    retry: async () => "ok",
    logout: () => assert.fail("không được logout"),
  };
  const outs = await Promise.all([
    handleAuthError(expired, deps),
    handleAuthError(expired, deps),
    handleAuthError(expired, deps),
  ]);
  assert.equal(refreshed, 1);
  assert.ok(outs.every((o) => o.handled));
});

test("refresh bị từ chối → logout, không treo vòng refresh", async () => {
  let logouts = 0;
  const p = handleAuthError(expired, {
    refresh: authRejected,
    retry: async () => assert.fail("không được retry"),
    logout: () => void logouts++,
  });
  await within(p, 50); // sau logout trang được điều hướng, promise để treo là chủ ý
  assert.equal(logouts, 1);
});

test("chính request refresh trả 401 (kể cả code 2) → logout ngay, không refresh lại", async () => {
  let logouts = 0;
  let refreshed = 0;
  await within(
    handleAuthError(
      { ...expired, isRefreshRequest: true },
      {
        refresh: async () => void refreshed++,
        retry: async () => "x",
        logout: () => void logouts++,
      },
    ),
    50,
  );
  assert.equal(refreshed, 0);
  assert.equal(logouts, 1);
});

test("request đã retry vẫn 401 → logout, không lặp vô hạn", async () => {
  let logouts = 0;
  await within(
    handleAuthError(
      { ...expired, isRetry: true },
      {
        refresh: async () => assert.fail("không refresh nữa"),
        retry: async () => "x",
        logout: () => void logouts++,
      },
    ),
    50,
  );
  assert.equal(logouts, 1);
});

test("401 code khác 2 (token sai) → logout", async () => {
  let logouts = 0;
  await within(
    handleAuthError(
      { ...expired, code: 1 },
      {
        refresh: async () => {},
        retry: async () => "x",
        logout: () => void logouts++,
      },
    ),
    50,
  );
  assert.equal(logouts, 1);
});

test("refresh lỗi tạm thời (timeout/5xx) → không logout, lần sau refresh lại được", async () => {
  let calls = 0;
  const first = await handleAuthError(expired, {
    refresh: async () => {
      calls++;
      throw { response: { status: 503 } };
    },
    retry: async () => assert.fail("không retry khi refresh lỗi"),
    logout: () => assert.fail("không được logout"),
  });
  assert.deepEqual(first, { handled: false });

  // trước đây promise refresh lỗi bị giữ lại → mọi lần sau đều lỗi đến khi F5
  const second = await within(
    handleAuthError(expired, {
      refresh: async () => void calls++,
      retry: async () => "ok",
      logout: () => assert.fail("không được logout"),
    }),
  );
  assert.deepEqual(second, { handled: true, result: "ok" });
  assert.equal(calls, 2);
});
