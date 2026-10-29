export const isDevelopment = import.meta.env.VITE_STAGE === 'development'

export const browserHostname =
  typeof window === 'undefined' ? 'localhost' : window.location.hostname

export function resolveDevelopmentHost(value: string | undefined): string | undefined {
  if (!value || !isDevelopment || ['localhost', '127.0.0.1'].includes(browserHostname)) {
    return value
  }

  try {
    const url = new URL(value)
    if (['localhost', '127.0.0.1'].includes(url.hostname)) {
      url.hostname = browserHostname
      return url.toString().replace(/\/$/, '')
    }
  } catch {
    return value
  }

  return value
}

export const API_URL = resolveDevelopmentHost(import.meta.env.VITE_APP_API_URL)
export const WSS_URL = resolveDevelopmentHost(import.meta.env.VITE_APP_WSS_URL)
