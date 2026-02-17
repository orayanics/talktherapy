import axios from "axios";

export const api = () => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  instance.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
};
