import { isAxiosError, isCancel } from 'axios'

export function retryApiQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= 3 || !isAxiosError(error) || isCancel(error)) return false
  const status = error.response?.status
  return (
    status === undefined || status === 408 || status === 429 || status >= 500
  )
}
