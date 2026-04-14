import { API_URL, WSS_TOKEN_URL } from '@/constants/application'
import { useEffect, useRef, useState } from 'react'

export interface DiagState {
  iceConnection: RTCIceConnectionState | '—'
  iceGathering: RTCIceGatheringState | '—'
  pcConnection: RTCPeerConnectionState | '—'
  signalingState: RTCSignalingState | '—'
  candidatesSent: number
  candidatesRecv: number
  trackCount: number
  polite: boolean | null
  remotePeerId: string | null
}

const INITIAL_DIAG: DiagState = {
  iceConnection: '—',
  iceGathering: '—',
  pcConnection: '—',
  signalingState: '—',
  candidatesSent: 0,
  candidatesRecv: 0,
  trackCount: 0,
  polite: null,
  remotePeerId: null,
}

type PermissionState = 'prompting' | 'granted' | 'denied'

type PeerMediaState = {
  mic: boolean
  camera: boolean
}

export function useRoomSession(roomId: string) {
  const localRef = useRef<HTMLVideoElement | null>(null)
  const remoteRef = useRef<HTMLVideoElement | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const dcRef = useRef<RTCDataChannel | null>(null)
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([])
  const localStreamRef = useRef<MediaStream | null>(null)

  const [messages, setMessages] = useState<string[]>([])
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [connected, setConnected] = useState(false)
  const [diag, setDiag] = useState<DiagState>(INITIAL_DIAG)
  const [permission, setPermission] = useState<PermissionState>('prompting')
  const [micEnabled, setMicEnabled] = useState(true)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [peerMedia, setPeerMedia] = useState<PeerMediaState>({
    mic: true,
    camera: true,
  })

  const patchDiag = (patch: Partial<DiagState>) =>
    setDiag((prev) => ({ ...prev, ...patch }))

  useEffect(() => {
    const localEl = localRef.current
    if (!localEl) return
    localEl.srcObject = localStream
  }, [localStream])

  useEffect(() => {
    const abort = new AbortController()
    let disposed = false
    let reconnectAttempts = 0
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let hasOpenedOnce = false

    async function start() {
      if (!roomId) return

      const API_BASE = API_URL
      const wsProto = WSS_TOKEN_URL

      const bindDataChannel = (channel: RTCDataChannel) => {
        dcRef.current = channel
        channel.onopen = () => console.log('[rtc] data channel open')
        channel.onmessage = (e: MessageEvent<string>) =>
          setMessages((m) => [...m, `Peer: ${e.data}`])
        channel.onclose = () => {
          if (dcRef.current === channel) dcRef.current = null
        }
      }

      let polite = false
      let makingOffer = false
      let ignoreOffer = false
      let negotiatePending = false
      let remotePeerId: string | null = null
      let pc: RTCPeerConnection | null = null
      let mediaReady = false

      const maybeSendPeerReady = () => {
        const ws = wsRef.current
        if (!ws || ws.readyState !== WebSocket.OPEN) return
        if (!mediaReady || !remotePeerId) return
        ws.send(JSON.stringify({ type: 'peer:ready' }))
      }

      const createPeerConnection = () => {
        const nextPc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
          ],
        })

        nextPc.onconnectionstatechange = () => {
          patchDiag({ pcConnection: nextPc.connectionState })
        }

        nextPc.onsignalingstatechange = () => {
          patchDiag({ signalingState: nextPc.signalingState })
        }

        nextPc.oniceconnectionstatechange = () => {
          patchDiag({ iceConnection: nextPc.iceConnectionState })
          if (nextPc.iceConnectionState === 'failed') {
            nextPc.restartIce()
            void negotiate()
          }
        }

        nextPc.onicegatheringstatechange = () => {
          patchDiag({ iceGathering: nextPc.iceGatheringState })
        }

        nextPc.ontrack = (ev) => {
          setDiag((prev) => ({ ...prev, trackCount: prev.trackCount + 1 }))
          const videoEl = remoteRef.current
          if (!videoEl) return

          if (ev.streams[0]) {
            if (videoEl.srcObject !== ev.streams[0]) {
              videoEl.srcObject = ev.streams[0]
            }
          } else {
            if (!(videoEl.srcObject instanceof MediaStream)) {
              videoEl.srcObject = new MediaStream()
            }
            videoEl.srcObject.addTrack(ev.track)
          }

          if (videoEl.paused) {
            void videoEl.play().catch(() => {})
          }

          ev.track.onunmute = () => {
            const el = remoteRef.current
            if (!el) return
            if (el.paused) void el.play().catch(() => {})
          }
        }

        nextPc.ondatachannel = (ev) => bindDataChannel(ev.channel)

        nextPc.onicecandidate = (ev) => {
          if (!ev.candidate) return
          const ws = wsRef.current
          if (ws?.readyState !== WebSocket.OPEN) return
          ws.send(
            JSON.stringify({
              type: 'webrtc:ice-candidate',
              candidate: ev.candidate.toJSON(),
            }),
          )
          setDiag((prev) => ({
            ...prev,
            candidatesSent: prev.candidatesSent + 1,
          }))
        }

        pcRef.current = nextPc
        return nextPc
      }

      const attachLocalTracks = (targetPc: RTCPeerConnection) => {
        const stream = localStreamRef.current
        if (!stream) return
        for (const track of stream.getTracks()) targetPc.addTrack(track, stream)
      }

      const resetPeerConnection = (reason: string) => {
        pendingCandidatesRef.current = []
        makingOffer = false
        ignoreOffer = false
        negotiatePending = false
        remotePeerId = null
        polite = false

        dcRef.current?.close()
        dcRef.current = null

        if (pc) {
          pc.ontrack = null
          pc.onicecandidate = null
          pc.ondatachannel = null
          pc.close()
        }

        const remoteEl = remoteRef.current
        if (reason === 'remote peer left' && remoteEl) {
          remoteEl.srcObject = null
        }

        pc = createPeerConnection()
        attachLocalTracks(pc)
      }

      const ensureDataChannel = () => {
        if (!pc || dcRef.current) return
        bindDataChannel(pc.createDataChannel('chat'))
      }

      const negotiate = async () => {
        const ws = wsRef.current
        if (!pc || !ws || ws.readyState !== WebSocket.OPEN) return
        if (makingOffer) {
          negotiatePending = true
          return
        }
        if (pc.signalingState !== 'stable') return
        if (!remotePeerId) return

        try {
          makingOffer = true
          negotiatePending = false
          ensureDataChannel()
          const offer = await pc.createOffer({ iceRestart: true })
          await pc.setLocalDescription(offer)
          ws.send(JSON.stringify({ type: 'webrtc:offer', sdp: offer }))
        } finally {
          makingOffer = false
          if (negotiatePending) void negotiate()
        }
      }

      const flushPendingCandidates = async () => {
        if (!pc) return
        const candidates = pendingCandidatesRef.current.splice(0)
        for (const candidate of candidates) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate))
          } catch {
            // ignore stale candidates
          }
        }
      }

      const scheduleReconnect = () => {
        if (disposed || reconnectTimer) return
        const delay = Math.min(1000 * 2 ** reconnectAttempts, 10000)
        reconnectAttempts += 1
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null
          void connectWebSocket()
        }, delay)
      }

      const getJoinToken = async () => {
        const res = await fetch(
          `${API_BASE}/appointments/${roomId}/join-token`,
          {
            method: 'POST',
            credentials: 'include',
            signal: abort.signal,
          },
        )

        if (res.status === 403) {
          window.location.assign('/unauthorized')
          throw new Error('Forbidden')
        }

        if (!res.ok) throw new Error(await res.text())
        const data = (await res.json()) as { token: string }
        return data.token
      }

      const connectWebSocket = async () => {
        if (disposed) return

        try {
          const token = await getJoinToken()
          const wssUrl = `${wsProto}${encodeURIComponent(token)}`
          const ws = new WebSocket(wssUrl)
          wsRef.current = ws

          ws.onopen = () => {
            if (disposed) {
              ws.close()
              return
            }

            setConnected(true)
            reconnectAttempts = 0

            if (hasOpenedOnce) {
              resetPeerConnection('websocket reconnected')
            } else {
              hasOpenedOnce = true
            }

            ws.send(
              JSON.stringify({
                type: 'join',
                room: roomId,
                user: { id: 'me', name: 'Me' },
              }),
            )
          }

          ws.onmessage = async (ev: MessageEvent<string>) => {
            let msg: Record<string, any>
            try {
              msg = JSON.parse(ev.data)
            } catch {
              return
            }
            if (!msg.type) return

            switch (msg.type as string) {
              case 'room:joined': {
                if (!pc) return
                const existingPeers: { peerId: string }[] = Array.isArray(
                  msg.existingPeers,
                )
                  ? msg.existingPeers
                  : []
                polite = existingPeers.length > 0
                remotePeerId = existingPeers[0]?.peerId ?? null
                patchDiag({ polite, remotePeerId })

                if (remotePeerId) {
                  if (polite) maybeSendPeerReady()
                  else await negotiate()
                }
                break
              }

              case 'room:peer-joined': {
                if (!remotePeerId) remotePeerId = msg.peerId ?? null
                patchDiag({ remotePeerId })
                if (polite) maybeSendPeerReady()
                else await negotiate()
                break
              }

              case 'room:resync': {
                if (msg.peerId) {
                  remotePeerId = msg.peerId as string
                  patchDiag({ remotePeerId })
                }
                if (polite) maybeSendPeerReady()
                else await negotiate()
                break
              }

              case 'room:peer-left': {
                if (msg.peerId === remotePeerId) {
                  remotePeerId = null
                  patchDiag({ remotePeerId: null })
                  setPeerMedia({ mic: true, camera: true })
                  resetPeerConnection('remote peer left')
                }
                break
              }

              case 'webrtc:offer': {
                if (!pc) return
                if (!remotePeerId && msg.from) {
                  remotePeerId = msg.from as string
                  patchDiag({ remotePeerId })
                }
                if (msg.from && msg.from !== remotePeerId) return

                const offerCollision =
                  makingOffer || pc.signalingState !== 'stable'
                ignoreOffer = !polite && offerCollision
                if (ignoreOffer) return

                await pc.setRemoteDescription(
                  new RTCSessionDescription(msg.sdp),
                )
                await flushPendingCandidates()
                const answer = await pc.createAnswer()
                await pc.setLocalDescription(answer)
                ws.send(JSON.stringify({ type: 'webrtc:answer', sdp: answer }))
                ignoreOffer = false
                break
              }

              case 'webrtc:answer': {
                if (!pc) return
                if (!remotePeerId && msg.from) {
                  remotePeerId = msg.from as string
                  patchDiag({ remotePeerId })
                }
                if (msg.from && msg.from !== remotePeerId) return

                await pc.setRemoteDescription(
                  new RTCSessionDescription(msg.sdp),
                )
                await flushPendingCandidates()
                ignoreOffer = false
                break
              }

              case 'webrtc:ice-candidate': {
                if (!pc) return
                if (ignoreOffer) return
                if (!remotePeerId && msg.from) {
                  remotePeerId = msg.from as string
                  patchDiag({ remotePeerId })
                }
                if (msg.from && msg.from !== remotePeerId) return

                setDiag((prev) => ({
                  ...prev,
                  candidatesRecv: prev.candidatesRecv + 1,
                }))

                if (pc.remoteDescription) {
                  try {
                    await pc.addIceCandidate(new RTCIceCandidate(msg.candidate))
                  } catch {
                    // ignore
                  }
                } else {
                  pendingCandidatesRef.current.push(msg.candidate)
                }
                break
              }

              case 'chat:message': {
                if (remotePeerId && msg.from && msg.from !== remotePeerId)
                  return
                setMessages((m) => [...m, `Peer: ${String(msg.text ?? '')}`])
                break
              }

              case 'media:toggle': {
                if (msg.kind === 'mic') {
                  setPeerMedia((prev) => ({
                    ...prev,
                    mic: Boolean(msg.enabled),
                  }))
                }
                if (msg.kind === 'camera') {
                  setPeerMedia((prev) => ({
                    ...prev,
                    camera: Boolean(msg.enabled),
                  }))
                }
                break
              }

              case 'peer:ready': {
                if (!polite) await negotiate()
                break
              }
            }
          }

          ws.onclose = () => {
            if (wsRef.current === ws) wsRef.current = null
            setConnected(false)
            scheduleReconnect()
          }

          ws.onerror = () => {
            // no-op: close handler drives reconnect
          }
        } catch {
          scheduleReconnect()
        }
      }

      try {
        setPermission('prompting')
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        })
        localStreamRef.current = stream
        setLocalStream(stream)
        setPermission('granted')
        setMicEnabled(stream.getAudioTracks().every((track) => track.enabled))
        setCameraEnabled(
          stream.getVideoTracks().every((track) => track.enabled),
        )
        mediaReady = true
      } catch {
        setPermission('denied')
        return
      }

      pc = createPeerConnection()
      attachLocalTracks(pc)
      await connectWebSocket()
      maybeSendPeerReady()
    }

    start().catch(() => {
      // handled by local guards
    })

    return () => {
      disposed = true
      abort.abort()
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
      localStreamRef.current?.getTracks().forEach((t) => t.stop())
      setLocalStream(null)
      dcRef.current?.close()
      wsRef.current?.close()
      pcRef.current?.close()
    }
  }, [roomId])

  const sendMediaToggle = (kind: 'mic' | 'camera', enabled: boolean) => {
    const ws = wsRef.current
    if (ws?.readyState !== WebSocket.OPEN) return
    ws.send(
      JSON.stringify({
        type: 'media:toggle',
        kind,
        enabled,
      }),
    )
  }

  const toggleMic = () => {
    const stream = localStreamRef.current
    if (!stream) return
    const tracks = stream.getAudioTracks()
    if (!tracks.length) return
    const next = !tracks.every((track) => track.enabled)
    tracks.forEach((track) => {
      track.enabled = next
    })
    setMicEnabled(next)
    sendMediaToggle('mic', next)
  }

  const toggleCamera = () => {
    const stream = localStreamRef.current
    if (!stream) return
    const tracks = stream.getVideoTracks()
    if (!tracks.length) return
    const next = !tracks.every((track) => track.enabled)
    tracks.forEach((track) => {
      track.enabled = next
    })
    setCameraEnabled(next)
    sendMediaToggle('camera', next)
  }

  const sendChat = (text: string) => {
    const dc = dcRef.current
    const ws = wsRef.current
    if (dc?.readyState === 'open') {
      dc.send(text)
      setMessages((m) => [...m, `You: ${text}`])
    } else if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'chat:message', text }))
      setMessages((m) => [...m, `You: ${text}`])
    }
  }

  return {
    localRef,
    remoteRef,
    messages,
    connected,
    diag,
    permission,
    hasPeer: Boolean(diag.remotePeerId),
    micEnabled,
    cameraEnabled,
    peerMedia,
    toggleMic,
    toggleCamera,
    sendChat,
  }
}
