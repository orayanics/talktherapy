import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'
import { API_URL } from '#/constants/application'

const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_URL ?? 'http://localhost:8080'}`,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    Accept: 'application/json',
  },
})

// optional: request interceptor (runs before every request)
apiClient.interceptors.request.use(async (config) => {
  const method = config.method?.toUpperCase()
  const contentType = config.headers.get('Content-Type') ?? config.headers['Content-Type']
  if (
    ['POST', 'PUT', 'PATCH'].includes(method ?? '') &&
    typeof config.data === 'string' &&
    /^[[]{/.test(config.data.trim()) &&
    !contentType
  ) {
    config.headers.set('Content-Type', 'application/json')
  }

  if (typeof document !== 'undefined' && !config.headers['X-XSRF-TOKEN']) {
    const token = document.cookie
      .split('; ')
      .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
      ?.slice('XSRF-TOKEN='.length)

    if (token) {
      config.headers.set('X-XSRF-TOKEN', decodeURIComponent(token))
    }
  }

  return config
})

type CsrfRetryConfig = AxiosRequestConfig & {
  _csrfRetry?: boolean
}

// optional: response interceptor (centralized error handling)
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const status = error.response?.status
    const config = error.config as CsrfRetryConfig | undefined

    if (status === 419 && config && !config._csrfRetry) {
      config._csrfRetry = true
      await initializeCsrf()
      return apiClient.request(config)
    }

    return Promise.reject(error)
  },
)

export async function initializeCsrf(): Promise<void> {
  await apiClient.get('/sanctum/csrf-cookie')
}

export async function api<T = any>(
  url: string,
  options: AxiosRequestConfig = {},
): Promise<T> {
  const response = await apiClient.request<T>({
    url,
    ...options,
  })
  return response.data
}

// error type from laravel: { message: string; errors?: Record<string, string[]> }
export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}
