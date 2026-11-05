/**
 * Logic xử lý 401 cho adminApi (tách riêng, không phụ thuộc axios/Next để test được).
 *
 * Quy tắc:
 * - 401 code=2 (access token hết hạn) ở request thường → gọi refresh 1 lần (gộp
 *   các request đồng thời vào cùng 1 lần refresh) rồi gửi lại request đó 1 lần.
 * - Chính request refresh lỗi → KHÔNG được đi lại nhánh refresh (trước đây request
 *   refresh tự `await` chính promise của nó → treo vĩnh viễn, mọi API sau đó treo theo).
 * - Refresh bị từ chối (401) hoặc request đã retry vẫn 401 → logout + về trang login.
 * - Refresh lỗi tạm thời (mạng, timeout, 5xx) → trả lỗi cho request hiện tại nhưng
 *   reset trạng thái để lần gọi sau (vd vòng poll 5s) thử refresh lại, không kẹt.
 */

export const ACCESS_TOKEN_EXPIRED_CODE = 2;

export type AuthErrorInfo = {
  status?: number;
  code?: unknown;
  isRefreshRequest: boolean;
  isRetry: boolean;
};

export type AuthErrorHandlerDeps<R> = {
  /** gọi API refresh token (không đi qua handler này cho lỗi 401 của nó) */
  refresh: () => Promise<unknown>;
  /** gửi lại request gốc, đánh dấu đã retry */
  retry: () => Promise<R>;
  /** xoá cookie + chuyển về trang login */
  logout: () => Promise<void> | void;
};

let refreshPromise: Promise<unknown> | null = null;
let loggingOut: Promise<void> | null = null;

/** chạy refresh, gộp các lần gọi đồng thời; luôn reset sau khi xong (kể cả lỗi) */
function sharedRefresh(refresh: () => Promise<unknown>) {
  if (!refreshPromise) {
    refreshPromise = refresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function sharedLogout(logout: () => Promise<void> | void) {
  if (!loggingOut) {
    loggingOut = Promise.resolve()
      .then(logout)
      .catch(() => {})
      .finally(() => {
        loggingOut = null;
      });
  }
  return loggingOut;
}

/** promise không bao giờ resolve — dùng sau khi đã điều hướng về login */
const NEVER = new Promise<never>(() => {});

function isAuthRejection(err: unknown) {
  const status = (err as { response?: { status?: number } })?.response?.status;
  return status === 401 || status === 403;
}

/**
 * Trả về `{ handled: false }` nếu không phải lỗi auth (caller tự reject lỗi gốc).
 */
export async function handleAuthError<R>(
  info: AuthErrorInfo,
  deps: AuthErrorHandlerDeps<R>,
): Promise<{ handled: true; result: R } | { handled: false }> {
  if (info.status !== 401) return { handled: false };

  // refresh bị từ chối, token không hợp lệ, hoặc đã refresh rồi mà vẫn 401
  if (
    info.isRefreshRequest ||
    info.isRetry ||
    info.code !== ACCESS_TOKEN_EXPIRED_CODE
  ) {
    await sharedLogout(deps.logout);
    return NEVER;
  }

  try {
    await sharedRefresh(deps.refresh);
  } catch (err) {
    if (isAuthRejection(err)) {
      await sharedLogout(deps.logout);
      return NEVER;
    }
    // lỗi tạm thời: để caller reject lỗi gốc, lần sau thử lại
    return { handled: false };
  }

  return { handled: true, result: await deps.retry() };
}

/** chỉ dùng trong test */
export function __resetAuthRefreshState() {
  refreshPromise = null;
  loggingOut = null;
}
