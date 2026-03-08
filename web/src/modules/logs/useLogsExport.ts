import { useCallback, useRef, useState } from 'react'

export type ExportStatus =
  | 'idle'
  | 'connecting'
  | 'exporting'
  | 'done'
  | 'error'

export interface UseLogsExportReturn {
  status: ExportStatus
  progress: { current: number; total: number | null } | null
  error: string | null
  startExport: (date?: string) => void
  reset: () => void
}

export function useLogsExport(): UseLogsExportReturn {
  const wsRef = useRef<WebSocket | null>(null)
  const [status, setStatus] = useState<ExportStatus>('idle')
  const [progress, setProgress] = useState<{
    current: number
    total: number | null
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const wsBaseUrl = (() => {
    const base = String(
      import.meta.env.VITE_APP_WS_URL ?? 'wss://localhost:8000/api/v1',
    )
    const url = new URL(base)
    if (typeof window !== 'undefined') {
      url.hostname = window.location.hostname
    }
    return url.toString().replace(/\/$/, '')
  })()

  const reset = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
    setStatus('idle')
    setProgress(null)
    setError(null)
  }, [])

  const startExport = useCallback(
    (date?: string) => {
      // Prevent double connections
      if (status === 'connecting' || status === 'exporting') return

      reset()
      setStatus('connecting')

      const url =
        `${wsBaseUrl}/logs/export` +
        (date ? `?date=${encodeURIComponent(date)}` : '')

      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setStatus('exporting')
        ws.send(JSON.stringify({ type: 'start', ...(date ? { date } : {}) }))
      }

      ws.onerror = () => {
        setStatus('error')
        setError('Connection failed. Please try again.')
        wsRef.current = null
      }

      ws.onclose = (ev) => {
        // abnormal close — only treat as error if we haven't already ended
        if (ev.code !== 1000) {
          setStatus((prev) => {
            if (prev === 'connecting' || prev === 'exporting') {
              setError('Connection closed unexpectedly.')
              return 'error'
            }
            return prev
          })
        }
        wsRef.current = null
      }

      ws.onmessage = (event: MessageEvent) => {
        let msg: Record<string, unknown>
        try {
          msg = JSON.parse(event.data as string) as Record<string, unknown>
        } catch {
          return
        }

        switch (msg.type) {
          case 'progress':
            setProgress({
              current: typeof msg.current === 'number' ? msg.current : 0,
              total: typeof msg.total === 'number' ? msg.total : null,
            })
            break

          case 'done': {
            const filename =
              typeof msg.filename === 'string' ? msg.filename : 'logs.json'
            const contentType =
              typeof msg.contentType === 'string'
                ? msg.contentType
                : 'application/octet-stream'
            const b64 = typeof msg.data === 'string' ? msg.data : ''

            // Decode base64 → Blob → download
            const byteChars = atob(b64)
            const byteNums = new Uint8Array(byteChars.length)
            for (let i = 0; i < byteChars.length; i++) {
              byteNums[i] = byteChars.charCodeAt(i)
            }
            const blob = new Blob([byteNums], { type: contentType })
            const objectUrl = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = objectUrl
            a.download = filename
            a.click()
            URL.revokeObjectURL(objectUrl)

            setStatus('done')
            break
          }

          case 'error':
            setStatus('error')
            setError(
              typeof msg.message === 'string' ? msg.message : 'Export failed.',
            )
            break
        }
      }
    },
    [status, wsBaseUrl, reset],
  )

  return { status, progress, error, startExport, reset }
}
