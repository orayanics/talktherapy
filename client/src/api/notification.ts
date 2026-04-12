import { api } from './client'
import { queryOptions } from '@tanstack/react-query'
import type { NotificationItem } from '@/hooks/useNotifications'

export const fetchNotifications = () => {
  return queryOptions<NotificationItem[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api<{ data: NotificationItem[] }>(
        `/notifications/list`,
        {
          method: 'GET',
        },
      )
      return data
    },
    staleTime: 60 * 60 * 1000,
  })
}
