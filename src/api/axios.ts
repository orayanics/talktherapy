import axios from "axios";

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

export const api = (withAuth = true) => {
  if (withAuth) {
    return instance;
  }
  return axios.create({
    baseURL: import.meta.env.VITE_APP_API_BASE_URL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
};
