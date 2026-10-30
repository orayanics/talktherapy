import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '#/modules/auth/context/SessionContext'
import { api } from '#/lib/api/client'
import type { NotificationPage } from '#/modules/notifications/types/notification'

export function useNotifications() {
  const { id: userId } = useSession()
  const queryClient = useQueryClient()
  const queryKey = ['notifications', userId] as const
  const query = useInfiniteQuery({
    queryKey,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      api<NotificationPage>(`/api/v1/notifications?page=${pageParam}`),
    getNextPageParam: ({ meta }) =>
      meta.current_page < meta.last_page ? meta.current_page + 1 : undefined,
  })
  const notifications = [
    ...new Map(
      (query.data?.pages ?? [])
        .flatMap(({ data }) => data)
        .map((notification) => [notification.id, notification] as const),
    ).values(),
  ]

  const markRead = async (id: string) => {
    await api(`/api/v1/notifications/${id}/read`, { method: 'PATCH' })
    await queryClient.invalidateQueries({ queryKey })
  }

  return {
    notifications,
    markRead,
    refresh: () => queryClient.invalidateQueries({ queryKey }),
    isPending: query.isPending,
    isError: query.isError,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    loadNextPage: () => query.fetchNextPage(),
  }
}
