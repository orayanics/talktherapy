import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { sessionQueryOptions } from '../api/auth-client'
import type { UserResponse } from '../types/session'

export function useSessionRevalidation(user: UserResponse) {
  const router = useRouter()
  const { data, error } = useQuery({
    ...sessionQueryOptions,
    staleTime: 30_000,
    refetchOnMount: false,
  })
  useEffect(() => {
    if (error || (data !== undefined && data?.user !== user)) {
      void router.invalidate()
    }
  }, [data, error, router, user])
}
