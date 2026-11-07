import { redirect } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { sessionQueryOptions } from '../api/auth-client'

type GuardContext = { context: { queryClient: QueryClient }; preload?: boolean }

export async function requireSession({ context, preload }: GuardContext) {
  const session = await context.queryClient.query({
    ...sessionQueryOptions,
    staleTime: preload ? 30_000 : 0,
  })
  if (!session) throw redirect({ to: '/login' })
  return { user: session.user }
}

export async function requireGuest({ context, preload }: GuardContext) {
  const session = await context.queryClient.query({
    ...sessionQueryOptions,
    staleTime: preload ? 30_000 : 0,
  })
  if (session) throw redirect({ to: '/dashboard' })
}
