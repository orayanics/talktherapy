import axios, { type AxiosRequestConfig } from "axios";
import qs from "qs";
import { AXIOS, SESSION } from "~/config/message";
import { showAlertGlobal } from "~/context/AlertContext";

const instance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  paramsSerializer: (params) =>
    qs.stringify(params, { arrayFormat: "comma", skipNulls: true }),
});

// queue
let isRefreshing = false;
let failedQueue: Array<{
  resolve: () => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

const SKIP_REFRESH_URLS = ["/auth/login", "/auth/refresh"];

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original: AxiosRequestConfig & { _retry?: boolean } = error.config;

    const is401 = error.response?.status === 401;
    const shouldSkip = SKIP_REFRESH_URLS.some((url) => original.url === url);
    const alreadyRetried = original._retry;

    if (!original || !is401 || shouldSkip || alreadyRetried) {
      if (is401) {
        showAlertGlobal(SESSION.expired, "error");
      } else {
        showAlertGlobal(AXIOS.generalError, "error");
      }
      return Promise.reject(error);
    }
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: () => resolve(instance(original)),
          reject,
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      await instance.post("/auth/refresh");
      processQueue(null);
      return instance(original);
    } catch (refreshError) {
      processQueue(refreshError);
      showAlertGlobal(SESSION.expired, "error");
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export { instance as api };
