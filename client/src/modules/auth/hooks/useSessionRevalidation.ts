import { useEffect } from 'react'
import { replaceEqualDeep, useQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { sessionQueryOptions } from '#/modules/auth/lib/session-query'
import type { UserResponse } from '../types/session'

export function useSessionRevalidation(user: UserResponse) {
  const router = useRouter()
  const { data, error } = useQuery({
    ...sessionQueryOptions,
    refetchOnMount: false,
  })
  useEffect(() => {
    if (
      error ||
      (data !== undefined && replaceEqualDeep(user, data?.user) !== user)
    ) {
      void router.invalidate()
    }
  }, [data, error, router, user])
}
