import { showAlertGlobal } from '@/context/AlertContext'
import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'

export async function csrf() {
  await fetch(`${import.meta.env.VITE_APP_API_URL}/sanctum/csrf-cookie`, {
    credentials: 'include',
  })
}

const apiClient: AxiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_APP_API_URL}`,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// optional: request interceptor (runs before every request)
apiClient.interceptors.request.use(async (config) => {
  // await csrf()
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
      await csrf()
      return apiClient.request(config)
    }

    if (status === 401) {
      showAlertGlobal('Session expired. Please log in again.', 'error')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (status === 403) {
      window.location.href = '/login'
      return Promise.reject(error)
    }

    return Promise.reject(error)
  },
)

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
