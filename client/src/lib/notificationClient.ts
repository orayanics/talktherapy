import { API_URL } from '@/constants/application'

type Subscriber = (items: any[]) => void

class NotificationClient {
  private ws: WebSocket | null = null
  private notifications: any[] = []
  private subs = new Set<Subscriber>()
  private connected = false
  private fetching = false

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
            this.notifications = [data.notification, ...this.notifications]
            this.notify()
          }
        } catch {}
      }
      ws.onclose = () => {
        this.ws = null
        this.connected = false
        // no auto-reconnect for now
      }
      this.ws = ws
    } catch (e) {
      this.connected = false
    }
  }

  notify() {
    const snapshot = [...this.notifications]
    for (const s of this.subs) s(snapshot)
  }

  subscribe(fn: Subscriber) {
    this.subs.add(fn)
    fn([...this.notifications])
    return () => this.subs.delete(fn)
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
