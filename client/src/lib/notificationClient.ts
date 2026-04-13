import { API_URL } from '@/constants/application'

type Subscriber = (items: any[]) => void

class NotificationClient {
  private ws: WebSocket | null = null
  private notifications: any[] = []
  private subs = new Set<Subscriber>()
  private connected = false
  private fetching = false
  private pendingRefresh: ReturnType<typeof setTimeout> | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectAttempts = 0

  private scheduleRefresh(delay = 120) {
    if (this.pendingRefresh) return
    this.pendingRefresh = setTimeout(() => {
      this.pendingRefresh = null
      void this.fetchList()
    }, delay)
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return
    if (this.subs.size === 0) return
    const attempt = Math.min(this.reconnectAttempts, 6)
    const baseDelay = 1000
    const delay = baseDelay * 2 ** attempt
    this.reconnectAttempts += 1
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      void this.connectOnce()
    }, delay)
  }

  private resetReconnectState() {
    this.reconnectAttempts = 0
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  async fetchList() {
    if (this.fetching) return
    this.fetching = true
    try {
      const res = await fetch(`${API_URL}/notifications/list`, {
        credentials: 'include',
      })
      if (!res.ok) return
      const json = await res.json()
      this.notifications = json.data ?? []
      this.notify()
    } catch (e) {
    } finally {
      this.fetching = false
    }
  }

  init(items: any[]) {
    this.notifications = items
    this.notify()
  }

  async connectOnce() {
    if (this.connected) return
    this.connected = true
    try {
      const r = await fetch(`${API_URL}/notifications/join-token`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!r.ok) {
        this.connected = false
        this.scheduleReconnect()
        return
      }
      const body = await r.json()
      const token = body.token
      const ws = new WebSocket(
        `${API_URL.replace(/^http/, 'ws')}/notifications/ws?token=${encodeURIComponent(token)}`,
      )
      this.ws = ws
      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data)
          if (data.type === 'notification' && data.notification) {
            this.notifications = [data.notification, ...this.notifications]
            this.notify()
          }
          this.scheduleRefresh()
        } catch {
          this.scheduleRefresh()
        }
      }
      ws.onclose = () => {
        this.ws = null
        this.connected = false
        this.scheduleReconnect()
      }
      ws.onopen = () => {
        this.resetReconnectState()
        this.scheduleRefresh(0)
      }
    } catch (e) {
      this.ws = null
      this.connected = false
      this.scheduleReconnect()
    }
  }

  notify() {
    const snapshot = [...this.notifications]
    for (const s of this.subs) s(snapshot)
  }

  subscribe(fn: Subscriber) {
    this.subs.add(fn)
    fn([...this.notifications])
    return () => {
      this.subs.delete(fn)
      if (this.subs.size === 0) {
        this.resetReconnectState()
        if (this.ws) {
          this.ws.close()
          this.ws = null
        }
        this.connected = false
      }
    }
  }

  async markRead(id: string) {
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'POST',
        credentials: 'include',
      })
      this.notifications = this.notifications.map((n) =>
        n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
      )
      this.notify()
    } catch {}
  }
}

export const notificationClient = new NotificationClient()
