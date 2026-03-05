import axios from 'axios'
import qs from 'qs'
import type { AxiosRequestConfig } from 'axios'
import { AXIOS, SESSION } from '~/config/message'
import { showAlertGlobal } from '~/context/AlertContext'

// Derive the API base URL dynamically so the same JS bundle works
// regardless of which IP/hostname the browser loaded the page from.
// VITE_APP_API_URL uses "localhost" as the host; on the client we swap it
// for window.location.hostname so LAN devices hit the right IP.
// On the server (SSR) window is undefined — localhost is correct there anyway.
const _rawApiUrl =
  (import.meta.env.VITE_APP_API_URL as string | undefined) ??
  'https://localhost:8000/api/v1'
const _apiBase =
  typeof window !== 'undefined'
    ? _rawApiUrl.replace('localhost', window.location.hostname)
    : _rawApiUrl

const instance = axios.create({
  baseURL: _apiBase,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
  paramsSerializer: (params) =>
    qs.stringify(params, { arrayFormat: 'comma', skipNulls: true }),
})

// queue
let isRefreshing = false
let failedQueue: Array<{
  resolve: () => void
  reject: (err: unknown) => void
}> = []

const processQueue = (error: unknown) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()))
  failedQueue = []
}

const SKIP_REFRESH_URLS = ['/auth/login', '/auth/refresh']

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original: AxiosRequestConfig & { _retry?: boolean } = error.config

    const is401 = error.response?.status === 401
    const shouldSkip = SKIP_REFRESH_URLS.some((url) => original.url === url)
    const alreadyRetried = original._retry

    if (!is401 || shouldSkip || alreadyRetried) {
      if (is401) {
        showAlertGlobal(SESSION.expired, 'error')
      } else {
        showAlertGlobal(AXIOS.generalError, 'error')
      }
      return Promise.reject(error)
    }
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: () => resolve(instance(original)),
          reject,
        })
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      await instance.post('/auth/refresh')
      processQueue(null)
      return instance(original)
    } catch (refreshError) {
      processQueue(refreshError)
      showAlertGlobal(SESSION.expired, 'error')
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export { instance as api }
