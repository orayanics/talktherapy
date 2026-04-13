import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'
import { API_URL } from '@/constants/application'

const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_URL ?? 'https://127.0.0.1:8080'}`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// optional: request interceptor (runs before every request)
apiClient.interceptors.request.use(async (config) => {
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
      return apiClient.request(config)
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
