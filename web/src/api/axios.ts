import axios, { type AxiosRequestConfig } from "axios";
import qs from "qs";

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

const SKIP_REFRESH_URLS = ["/auth/session", "/auth/login"];

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original: AxiosRequestConfig & { _retry?: boolean } = error.config;

    const is401 = error.response?.status === 401;
    const shouldSkip = SKIP_REFRESH_URLS.some((url) =>
      original.url?.includes(url),
    );
    const alreadyRetried = original._retry;

    if (!is401 || shouldSkip || alreadyRetried) {
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
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export { instance as api };
