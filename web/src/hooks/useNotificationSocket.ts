import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type {
  NotificationDto,
  NotificationWsMessage,
} from '~/models/notification'

const RECONNECT_DELAYS = [2_000, 5_000, 10_000, 30_000] // ms — backoff steps
const MAX_RETRIES = RECONNECT_DELAYS.length

function buildWsUrl(): string {
  const rawBase =
    import.meta.env.VITE_APP_WS_URL ?? 'wss://localhost:8000/api/v1'
  const url = new URL(`${rawBase}/notifications/ws`)
  if (typeof window !== 'undefined') {
    url.hostname = window.location.hostname
  }
  return url.toString()
}

/**
 * Connects to the notifications WebSocket endpoint and:
 * - Updates the unread count in React Query cache on connect (unread_count message)
 * - Prepends new notifications to the cached list on push (notification message)
 * - Increments unread count on push
 * - Automatically reconnects on close/error, refreshing the session cookie first
 *   so that an expired access token is transparently renewed via the axios
 *   refresh interceptor before the next WS upgrade attempt.
 *
 * Should be mounted once — typically inside the authenticated layout.
 */
export function useNotificationSocket({
  enabled = true,
}: { enabled?: boolean } = {}) {
  const qc = useQueryClient()
  const wsRef = useRef<WebSocket | null>(null)
  const retryRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const unmountedRef = useRef(false)
  // Track whether the socket ever reached OPEN state.
  // A close without ever opening means the server is down or rejected auth —
  // no point retrying until something external changes.
  const everOpenedRef = useRef(false)

  useEffect(() => {
    unmountedRef.current = false
    everOpenedRef.current = false

    if (!enabled) return

    function connect() {
      if (unmountedRef.current) return

      const ws = new WebSocket(buildWsUrl())
      wsRef.current = ws

      ws.onopen = () => {
        everOpenedRef.current = true
        retryRef.current = 0 // reset backoff on successful connect
      }

      ws.onmessage = (evt) => {
        let msg: NotificationWsMessage
        try {
          msg = JSON.parse(evt.data as string) as NotificationWsMessage
        } catch {
          return
        }

        if (msg.type === 'unread_count') {
          qc.setQueryData<number>(['notifications', 'unread'], msg.count)
        }

        if (msg.type === 'notification') {
          const payload: NotificationDto = msg.payload

          // Increment unread count
          qc.setQueryData<number>(
            ['notifications', 'unread'],
            (prev) => (prev ?? 0) + 1,
          )

          // Prepend to first page of the cached list
          qc.setQueryData<{
            data: Array<NotificationDto>
            meta: {
              total: number
              page: number
              per_page: number
              last_page: number
              unread: number
            }
          }>(['notifications', 1, 20], (prev) => {
            if (!prev) return prev
            return {
              ...prev,
              data: [payload, ...prev.data],
              meta: {
                ...prev.meta,
                total: prev.meta.total + 1,
                unread: prev.meta.unread + 1,
              },
            }
          })
        }
      }

      ws.onclose = (evt) => {
        if (unmountedRef.current) return

        // 4001 = our custom auth rejection (open() calls ws.close(4001))
        // 1008 = policy violation (HTTP 401 during WS upgrade)
        const isAuthRejection = evt.code === 4001 || evt.code === 1008

        // If we never reached OPEN, the server is either down or rejected auth.
        // Either way, stop — reconnecting in a tight loop won't help and
        // will flood the console.
        if (!everOpenedRef.current || isAuthRejection) return

        scheduleReconnect()
      }

      ws.onerror = () => {
        // Errors always precede a close event — handled there
      }
    }

    function scheduleReconnect() {
      if (unmountedRef.current) return
      if (retryRef.current >= MAX_RETRIES) return

      const delay = RECONNECT_DELAYS[retryRef.current]
      retryRef.current += 1

      timerRef.current = setTimeout(() => {
        if (unmountedRef.current) return
        connect()
      }, delay)
    }

    connect()

    return () => {
      unmountedRef.current = true
      if (timerRef.current) clearTimeout(timerRef.current)
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [enabled, qc])
}
