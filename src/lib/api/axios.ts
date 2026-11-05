import { logoutAction } from "@/actions/admin/auth";
import { adminRoutes } from "@/constants/route";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { handleAuthError } from "./auth-refresh";

type RetriableConfig = InternalAxiosRequestConfig & { _authRetry?: boolean };

class HttpClient {
  instance: AxiosInstance;

  constructor(
    baseURL: string,
    onError: (ins: AxiosInstance) => (error: unknown) => unknown,
  ) {
    const newAxios = axios.create({
      baseURL,
      timeout: 10000,
    });

    // Response interceptor
    newAxios.interceptors.response.use(
      (response: AxiosResponse) => response.data || response,
      onError(newAxios),
    );

    this.instance = newAxios;
  }
}

/** xoá cookie phía server rồi về trang login (kèm callback về trang hiện tại) */
async function logoutAndRedirect() {
  try {
    await logoutAction();
  } catch {
    // vẫn chuyển về login; refresh route cũng đã xoá cookie khi từ chối
  }
  const { pathname, search } = window.location;
  const callback = pathname.startsWith(adminRoutes.login())
    ? ""
    : `?callback_url=${encodeURIComponent(pathname + search)}`;
  window.location.replace(`${adminRoutes.login()}${callback}`);
}

/**
 * Gọi refresh bằng axios "trần" (không qua interceptor của adminApi) để lỗi
 * 401 của chính nó trả thẳng về cho `handleAuthError` thay vì lặp lại vòng refresh.
 */
const rawRefresh = () =>
  axios.post(adminRoutes.refreshTokenApi(), undefined, {
    baseURL: "/",
    timeout: 10000,
  });

const adminApi = new HttpClient(
  "/",
  (instance: AxiosInstance) => async (error: unknown) => {
    if (!(error instanceof AxiosError) || !error.config || !error.response) {
      return Promise.reject(error);
    }

    const config = error.config as RetriableConfig;
    const outcome = await handleAuthError(
      {
        status: error.response.status,
        code: (error.response.data as { code?: unknown } | undefined)?.code,
        isRefreshRequest: config.url === adminRoutes.refreshTokenApi(),
        isRetry: !!config._authRetry,
      },
      {
        refresh: rawRefresh,
        retry: () =>
          instance.request({ ...config, _authRetry: true } as RetriableConfig),
        logout: logoutAndRedirect,
      },
    );

    if (outcome.handled) return outcome.result;
    return Promise.reject(error);
  },
).instance;

export default adminApi;

export const webApi = new HttpClient("/", () => async (error: unknown) => {
  throw error;
}).instance;
