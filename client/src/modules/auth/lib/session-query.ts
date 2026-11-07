import { queryOptions } from '@tanstack/react-query'
import { fetchSession } from '../api/auth-client'
import type { Session } from '../api/auth-client'

export const sessionQueryOptions = queryOptions({
  queryKey: ['session'],
  retry: false,
  staleTime: 0,
  queryFn: async ({ signal, client }): Promise<Session> => {
    const session = await fetchSession(signal)
    const previous = client.getQueryData<Session>(['session'])
    if (
      previous?.user.id !== session?.user.id ||
      previous?.user.role !== session?.user.role
    ) {
      client.removeQueries({
        predicate: (query) => query.queryKey[0] !== 'session',
      })
    }
    return session
  },
})
