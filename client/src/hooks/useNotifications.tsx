import { useEffect, useState } from 'react'
import { notificationClient } from '@/lib/notificationClient'

export type NotificationItem = {
  id: string
  type: string
  title: string
  message: string
  readAt: string | null
  createdAt: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  useEffect(() => {
    const unsub = notificationClient.subscribe((items) =>
      setNotifications(items),
    )

    notificationClient.fetchList()
    notificationClient.connectOnce()

    return () => {
      unsub()
    }
  }, [])

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
