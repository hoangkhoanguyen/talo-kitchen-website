import { logoutAction } from "@/actions/admin/auth";
import { adminRoutes } from "@/constants/route";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { th } from "zod/v4/locales";

let refreshTokenPromise: any;

class HttpClient {
  instance: AxiosInstance;

  constructor(
    baseURL: string,
    onError: (ins: AxiosInstance) => (error: unknown) => void,
  ) {
    const newAxios = axios.create({
      baseURL,
      timeout: 10000,
    });

    // Request interceptor
    newAxios.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor
    newAxios.interceptors.response.use(
      (response: AxiosResponse) => response.data || response,
      onError(newAxios),
    );

    this.instance = newAxios;
  }
}

const adminApi = new HttpClient(
  "/",
  (instance: AxiosInstance) => async (error: unknown) => {
    if (
      error instanceof AxiosError &&
      error.config &&
      error.response &&
      error.response.status === 401
    ) {
      if ((error.response.data as any)?.code !== 2) {
        await logoutAction();
        window.location.reload();
        return;
      }

      if (!refreshTokenPromise) {
        const handleRenewToken = () => {
          refreshTokenPromise = instance.post(adminRoutes.refreshTokenApi());

          return refreshTokenPromise as Promise<void>;
        };

        return handleRenewToken().then(() => {
          refreshTokenPromise = null;
          return instance.request(error.config!);
        });
      }

      await refreshTokenPromise;

      return instance.request(error.config);
    }

    return Promise.reject(error);
  },
).instance;

export default adminApi;

export const webApi = new HttpClient("/", () => async (error: unknown) => {
  throw error;
}).instance;
