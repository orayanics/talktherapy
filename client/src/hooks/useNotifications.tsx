import { useCallback, useEffect, useRef, useState } from 'react'
import { API_URL } from '@/constants/application'

type NotificationItem = {
  id: string
  type: string
  title: string
  message: string
  readAt: string | null
  createdAt: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)

  const fetchList = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/notifications/list`, {
        credentials: 'include',
      })
      if (!res.ok) return
      const json = await res.json()
      setNotifications(json.data ?? [])
      setUnreadCount((json.data ?? []).filter((n: any) => !n.readAt).length)
    } catch (e) {
      // ignore
    }
  }, [])

  const connect = useCallback(async () => {
    try {
      const r = await fetch(`${API_URL}/notifications/join-token`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!r.ok) return
      const body = await r.json()
      const token = body.token
      const ws = new WebSocket(
        `${API_URL.replace(/^http/, 'ws')}/notifications/ws?token=${encodeURIComponent(token)}`,
      )
      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data)
          if (data.type === 'notification' && data.notification) {
            setNotifications((s) => [data.notification, ...s])
            setUnreadCount((c) => c + 1)
          }
        } catch {}
      }
      ws.onclose = () => {
        wsRef.current = null
      }
      wsRef.current = ws
    } catch (e) {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchList()
    connect()
    return () => {
      wsRef.current?.close()
    }
  }, [fetchList, connect])

  const markRead = useCallback(async (id: string) => {
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'POST',
        credentials: 'include',
      })
      setNotifications((s) =>
        s.map((n) =>
          n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
        ),
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch {}
  }, [])

  return { notifications, unreadCount, markRead, refresh: fetchList }
}

export type { NotificationItem }
