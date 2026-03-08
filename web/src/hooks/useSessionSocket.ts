import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  ChatEntry,
  ClientMessage,
  PeerMediaState,
  ServerMessage,
  SessionParticipant,
} from '~/models/session'

export type SocketStatus = 'connecting' | 'open' | 'closed' | 'error'

export interface UseSessionSocketOptions {
  roomId: string
  userId: string
  onOffer?: (sdp: string, from: string) => void
  onAnswer?: (sdp: string, from: string) => void
  onIceCandidate?: (
    candidate: string,
    sdpMid: string | null,
    sdpMLineIndex: number | null,
  ) => void
  onPeerReady?: (from: string) => void
}

export interface UseSessionSocketReturn {
  status: SocketStatus
  participants: Array<SessionParticipant>
  chatMessages: Array<ChatEntry>
  peerMediaState: PeerMediaState
  send: (msg: ClientMessage) => void
}

/**
 * Connects to the session WebSocket server and manages:
 * - Participants list
 * - Chat messages
 * - WebRTC signaling delegation (offer/answer/ICE/ready → callbacks)
 * - Peer media toggle state
 */
export function useSessionSocket({
  roomId,
  userId,
  onOffer,
  onAnswer,
  onIceCandidate,
  onPeerReady,
}: UseSessionSocketOptions): UseSessionSocketReturn {
  const wsRef = useRef<WebSocket | null>(null)
  const [status, setStatus] = useState<SocketStatus>('connecting')
  const [participants, setParticipants] = useState<Array<SessionParticipant>>(
    [],
  )
  const [chatMessages, setChatMessages] = useState<Array<ChatEntry>>([])
  const [peerMediaState, setPeerMediaState] = useState<PeerMediaState>({
    camera: true,
    mic: true,
  })

  // Keep callbacks in refs so the message handler doesn't get stale closures.
  const onOfferRef = useRef(onOffer)
  const onAnswerRef = useRef(onAnswer)
  const onIceCandidateRef = useRef(onIceCandidate)
  const onPeerReadyRef = useRef(onPeerReady)
  useEffect(() => {
    onOfferRef.current = onOffer
    onAnswerRef.current = onAnswer
    onIceCandidateRef.current = onIceCandidate
    onPeerReadyRef.current = onPeerReady
  })

  // Build the WebSocket URL.
  // VITE_APP_WS_URL uses "localhost" as host; on the client we swap it for
  // window.location.hostname so LAN devices connect to the right IP.
  const wsUrl = (() => {
    const base =
      import.meta.env.VITE_APP_WS_URL ?? 'wss://localhost:8000/api/v1'
    const url = new URL(base)

    // ssr check
    if (typeof window !== 'undefined') {
      url.hostname = window.location.hostname
    }
    return url.toString().replace(/\/$/, '') + '/session/' + roomId
  })()

  useEffect(() => {
    let stale = false
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      if (!stale) setStatus('open')
    }
    ws.onerror = () => {
      if (!stale) setStatus('error')
    }
    ws.onclose = () => {
      if (!stale) setStatus('closed')
    }

    ws.onmessage = (event: MessageEvent) => {
      if (stale) return
      let msg: ServerMessage
      try {
        msg = JSON.parse(event.data as string) as ServerMessage
      } catch {
        return
      }

      switch (msg.type) {
        case 'room:joined':
          setParticipants(msg.participants)
          break

        case 'room:left':
          setParticipants((prev) => prev.filter((p) => p.userId !== msg.userId))
          break

        case 'room:error':
          console.error('[session] room error:', msg.message)
          setStatus('error')
          break

        case 'chat:message':
          setChatMessages((prev) => [
            ...prev,
            {
              id: `${msg.timestamp}-${msg.from}`,
              from: msg.from,
              role: msg.role,
              text: msg.text,
              timestamp: msg.timestamp,
              isSelf: msg.from === userId,
            },
          ])
          break

        case 'webrtc:offer':
          onOfferRef.current?.(msg.sdp, msg.from)
          break

        case 'webrtc:answer':
          onAnswerRef.current?.(msg.sdp, msg.from)
          break

        case 'webrtc:ice-candidate':
          onIceCandidateRef.current?.(
            msg.candidate,
            msg.sdpMid,
            msg.sdpMLineIndex,
          )
          break

        case 'media:toggle':
          setPeerMediaState((prev) => ({
            ...prev,
            [msg.kind === 'camera' ? 'camera' : 'mic']: msg.enabled,
          }))
          break

        case 'peer:ready':
          onPeerReadyRef.current?.(msg.from)
          break
      }
    }

    return () => {
      stale = true
      ws.onopen = null
      ws.onerror = null
      ws.onclose = null
      ws.close()
      wsRef.current = null
    }
  }, [wsUrl])

  const send = useCallback((msg: ClientMessage) => {
    const ws = wsRef.current
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg))
    }
  }, [])

  return { status, participants, chatMessages, peerMediaState, send }
}
