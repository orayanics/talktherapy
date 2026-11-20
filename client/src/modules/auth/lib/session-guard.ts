import { redirect } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { sessionQueryOptions } from '#/modules/auth/lib/session-query'

type GuardContext = { context: { queryClient: QueryClient }; preload?: boolean }

export async function requireSession({ context }: GuardContext) {
  const session = await context.queryClient.query(sessionQueryOptions)
  if (!session) throw redirect({ to: '/login' })
  return { user: session.user }
}

export async function requireGuest({ context }: GuardContext) {
  const session = await context.queryClient.query(sessionQueryOptions)
  if (session) throw redirect({ to: '/dashboard' })
}
