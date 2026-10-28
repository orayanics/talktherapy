import { isAxiosError } from 'axios'

import type { ApiError } from '#/lib/api/client'

export const errMsg = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string => {
  if (!isAxiosError<ApiError>(error)) {
    return error instanceof Error ? error.message : fallback
  }

  return (
    Object.values(error.response?.data.errors ?? {})
      .flat()
      .at(0) ??
    error.response?.data.message ??
    fallback
  )
}
