import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { NotificationListDto } from '~/models/notification'
import { api } from '~/api/axios'

export const notificationsQuery = (page = 1, perPage = 20) =>
  ({
    queryKey: ['notifications', page, perPage],
    queryFn: async () => {
      const { data } = await api.get<NotificationListDto>('/notifications', {
        params: { page, per_page: perPage },
      })
      return data
    },
  }) as const

export const unreadCountQuery = () =>
  ({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => {
      const { data } = await api.get<number>('/notifications/unread')
      return data
    },
  }) as const

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.patch('/notifications/read'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useNotifications(page = 1, perPage = 20) {
  return useQuery(notificationsQuery(page, perPage))
}

export function useUnreadCount() {
  return useQuery(unreadCountQuery())
}
