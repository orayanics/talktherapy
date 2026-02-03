import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export const apiServer = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  withCredentials: true,
});

export const api = () => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  instance.interceptors.request.use((config) => {
    if (typeof document === "undefined") {
      return config;
    }
    const match = document.cookie
      .split("; ")
      .find((c) => c.startsWith("XSRF-TOKEN="));

    if (match) {
      config.headers["X-XSRF-TOKEN"] = decodeURIComponent(match.split("=")[1]);
    }
    return config;
  });

  // for csrf mismatch
  instance.interceptors.response.use(
    (res) => res,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 419 && !originalRequest._retry) {
        originalRequest._retry = true;
        await instance.get("/sanctum/csrf-cookie");
        return instance(originalRequest);
      }

      return Promise.reject(error);
    },
  );

  return instance;
};
