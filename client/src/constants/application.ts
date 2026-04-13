export const isDevelopment = import.meta.env.VITE_STAGE === 'development'
export const isProduction = import.meta.env.VITE_STAGE === 'production'

export const API_URL = isDevelopment
  ? import.meta.env.VITE_APP_API_URL
  : import.meta.env.VITE_HTTPS_API_URL
