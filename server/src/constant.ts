export const isDevelopment = process.env.SERVER_ENV === "development";
export const isProduction = process.env.SERVER_ENV === "production";

export const CLIENT_URL = isDevelopment
  ? process.env.CLIENT_URL
  : process.env.CLIENT_URL_HTTPS;
