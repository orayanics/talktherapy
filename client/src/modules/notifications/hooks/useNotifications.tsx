import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationClient } from '#/modules/notifications/api/notificationClient'
import { fetchNotifications } from '#/modules/notifications/api/notification'
import type { NotificationItem } from '#/modules/notifications/types/notification'

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const queryClient = useQueryClient()

  const { data } = useQuery(fetchNotifications())
  useEffect(() => {
    if (data) {
      setNotifications(data)
      notificationClient.init(data)
    }
  }, [data])

  useEffect(() => {
    const unsub = notificationClient.subscribe((items) => {
      setNotifications(items)
      queryClient.setQueryData(['notifications'], items)
    })

    notificationClient.connectOnce()

    return () => {
      unsub()
    }
  }, [queryClient])

  const markRead = async (id: string) => {
    await notificationClient.markRead(id)
  }

  const unreadCount = notifications.filter((n) => !n.readAt).length

  return {
    notifications,
    unreadCount,
    markRead,
    refresh: () => notificationClient.fetchList(),
  }
}
