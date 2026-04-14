export const isDevelopment = import.meta.env.VITE_STAGE === 'development'

export const API_URL = import.meta.env.VITE_APP_API_URL
export const WSS_URL = import.meta.env.VITE_APP_WSS_URL

export const WSS_TOKEN_URL = `wss://${location.hostname}:8080/session/ws?token=`
