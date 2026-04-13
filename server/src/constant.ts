export const isDevelopment = process.env.SERVER_ENV === "development";
export const isProduction = process.env.SERVER_ENV === "production";

// To array
export const TRUSTED_ORIGINS = process.env.DEV_TRUSTED_ORIGINS
  ? process.env.DEV_TRUSTED_ORIGINS.split(",").map((origin) => origin.trim())
  : [];
