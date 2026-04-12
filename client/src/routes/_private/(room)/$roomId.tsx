import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

export const Route = createFileRoute('/_private/(room)/$roomId')({
  component: RouteComponent,
})

interface DiagState {
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

function RouteComponent() {
  const roomId = Route.useParams().roomId
  const localRef = useRef<HTMLVideoElement | null>(null)
  const remoteRef = useRef<HTMLVideoElement | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const dcRef = useRef<RTCDataChannel | null>(null)
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([])
  const localStreamRef = useRef<MediaStream | null>(null)
  const [messages, setMessages] = useState<string[]>([])
  const [connected, setConnected] = useState(false)
  const [diag, setDiag] = useState<DiagState>(INITIAL_DIAG)

  const patchDiag = (patch: Partial<DiagState>) =>
    setDiag((prev) => ({ ...prev, ...patch }))

  useEffect(() => {
    const abort = new AbortController()
    let disposed = false
    let reconnectAttempts = 0
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let hasOpenedOnce = false

    async function start() {
      if (!roomId) return

      const API_BASE = `${location.protocol}//${location.hostname}:8080`
      const wsProto = location.protocol === 'https:' ? 'wss' : 'ws'
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
        if (!mediaReady) return
        if (!remotePeerId) return
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
          console.log('[rtc] connectionState', nextPc.connectionState)
          patchDiag({ pcConnection: nextPc.connectionState })
        }

        nextPc.onsignalingstatechange = () => {
          console.log('[rtc] signalingState', nextPc.signalingState)
          patchDiag({ signalingState: nextPc.signalingState })
        }

        nextPc.oniceconnectionstatechange = () => {
          console.log('[rtc] iceConnectionState', nextPc.iceConnectionState)
          patchDiag({ iceConnection: nextPc.iceConnectionState })
          if (nextPc.iceConnectionState === 'failed') {
            console.warn('[rtc] ICE failed — calling restartIce()')
            nextPc.restartIce()
            void negotiate()
          }
        }

        nextPc.onicegatheringstatechange = () => {
          console.log('[rtc] iceGatheringState', nextPc.iceGatheringState)
          patchDiag({ iceGathering: nextPc.iceGatheringState })
        }

        nextPc.ontrack = (ev) => {
          console.log(
            '[rtc] ontrack',
            ev.track.kind,
            'streams:',
            ev.streams.length,
          )
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
            void videoEl.play().catch((e) => {
              console.warn('[rtc] remote video autoplay blocked', e)
            })
          }

          ev.track.onunmute = () => {
            const el = remoteRef.current
            if (!el) return
            if (el.paused) {
              void el.play().catch((e) => {
                console.warn('[rtc] remote track unmuted but play() failed', e)
              })
            }
          }
        }

        nextPc.ondatachannel = (ev) => bindDataChannel(ev.channel)

        nextPc.onicecandidate = (ev) => {
          if (!ev.candidate) {
            console.log('[rtc] ICE gathering complete (null candidate)')
            return
          }
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
        console.log('[rtc] resetting peer connection:', reason)
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
          console.log('[rtc] sent offer to', remotePeerId)
        } catch (e) {
          console.warn('[rtc] negotiate failed', e)
        } finally {
          makingOffer = false
          if (negotiatePending) void negotiate()
        }
      }

      const flushPendingCandidates = async () => {
        if (!pc) return
        const candidates = pendingCandidatesRef.current.splice(0)
        if (candidates.length)
          console.log('[rtc] flushing', candidates.length, 'pending candidates')
        for (const candidate of candidates) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate))
          } catch (e) {
            console.warn('[rtc] addIceCandidate (queued) failed', e)
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

        if (!res.ok) {
          throw new Error(await res.text())
        }

        const data = (await res.json()) as { token: string }
        return data.token
      }

      const connectWebSocket = async () => {
        if (disposed) return

        try {
          const token = await getJoinToken()

          const wssUrl = `${wsProto}://${location.hostname}:8080/session/ws?token=${encodeURIComponent(token)}`
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
            console.log('[ws] sent join for room', roomId)
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
                ;(pc as any).__peerId = msg.peerId
                const existingPeers: { peerId: string }[] = Array.isArray(
                  msg.existingPeers,
                )
                  ? msg.existingPeers
                  : []
                polite = existingPeers.length > 0
                remotePeerId = existingPeers[0]?.peerId ?? null
                patchDiag({ polite, remotePeerId })
                console.log('[ws] joined', {
                  self: msg.peerId,
                  polite,
                  remotePeerId,
                  existingPeers,
                })

                if (remotePeerId) {
                  if (polite) {
                    maybeSendPeerReady()
                  } else {
                    await negotiate()
                  }
                }
                break
              }

              case 'room:peer-joined': {
                if (!remotePeerId) remotePeerId = msg.peerId ?? null
                patchDiag({ remotePeerId })
                console.log('[ws] peer-joined', msg.peerId, '— polite:', polite)
                if (polite) {
                  maybeSendPeerReady()
                } else {
                  await negotiate()
                }
                break
              }

              case 'room:peer-left': {
                if (msg.peerId === remotePeerId) {
                  remotePeerId = null
                  patchDiag({ remotePeerId: null })
                  const remoteEl = remoteRef.current
                  if (remoteEl) remoteEl.srcObject = null
                  resetPeerConnection('remote peer left')
                  console.log('[ws] remote peer left', msg.peerId)
                }
                break
              }

              case 'webrtc:offer': {
                if (!pc) return
                if (!remotePeerId && msg.from) remotePeerId = msg.from as string
                if (msg.from && msg.from !== remotePeerId) return

                const offerCollision =
                  makingOffer || pc.signalingState !== 'stable'
                ignoreOffer = !polite && offerCollision
                if (ignoreOffer) {
                  console.log('[rtc] ignoring collided offer (impolite peer)')
                  return
                }

                console.log('[rtc] received offer from', msg.from, '— applying')
                await pc.setRemoteDescription(
                  new RTCSessionDescription(msg.sdp),
                )
                await flushPendingCandidates()
                const answer = await pc.createAnswer()
                await pc.setLocalDescription(answer)
                ws.send(JSON.stringify({ type: 'webrtc:answer', sdp: answer }))
                ignoreOffer = false
                console.log('[rtc] sent answer to', msg.from)
                break
              }

              case 'webrtc:answer': {
                if (!pc) return
                if (!remotePeerId && msg.from) remotePeerId = msg.from as string
                if (msg.from && msg.from !== remotePeerId) return

                console.log('[rtc] received answer from', msg.from)
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
                if (!remotePeerId && msg.from) remotePeerId = msg.from as string
                if (msg.from && msg.from !== remotePeerId) return

                setDiag((prev) => ({
                  ...prev,
                  candidatesRecv: prev.candidatesRecv + 1,
                }))

                if (pc.remoteDescription) {
                  try {
                    await pc.addIceCandidate(new RTCIceCandidate(msg.candidate))
                  } catch (e) {
                    console.warn('[rtc] addIceCandidate failed', e)
                  }
                } else {
                  pendingCandidatesRef.current.push(msg.candidate)
                }
                break
              }

              case 'chat:message': {
                if (remotePeerId && msg.from && msg.from !== remotePeerId)
                  return
                const text = msg.text as string
                setMessages((m) => [...m, `Peer: ${text}`])
                break
              }

              case 'media:toggle': {
                console.log(
                  '[ws] media toggle',
                  msg.from,
                  msg.kind,
                  msg.enabled,
                )
                break
              }

              case 'peer:ready': {
                if (!polite) await negotiate()
                break
              }

              case 'room:error': {
                console.error('[ws] room error', msg.message)
                break
              }
            }
          }

          ws.onclose = () => {
            if (wsRef.current === ws) wsRef.current = null
            setConnected(false)
            console.log('[ws] closed, scheduling reconnect')
            scheduleReconnect()
          }

          ws.onerror = (e) => {
            console.error('[ws] error', e)
          }
        } catch (e) {
          console.error('[ws] connect failed, scheduling reconnect', e)
          scheduleReconnect()
        }
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        })
        localStreamRef.current = stream
        mediaReady = true
        if (localRef.current) localRef.current.srcObject = stream
        console.log(
          '[rtc] local tracks added:',
          stream.getTracks().map((t) => t.kind),
        )
        maybeSendPeerReady()
      } catch (e) {
        console.warn('[rtc] getUserMedia failed', e)
      }

      pc = createPeerConnection()
      attachLocalTracks(pc)
      await connectWebSocket()
    }

    start().catch((e: unknown) => {
      if (e instanceof Error && e.name === 'AbortError') return
      console.error('[rtc] fatal error', e)
    })

    return () => {
      disposed = true
      abort.abort()
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
      localStreamRef.current?.getTracks().forEach((t) => t.stop())
      dcRef.current?.close()
      wsRef.current?.close()
      pcRef.current?.close()
    }
  }, [roomId])

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

  const stateColor = (state: string) => {
    if (state === 'connected' || state === 'completed') return '#1a7a1a'
    if (state === 'failed' || state === 'disconnected') return '#b00'
    return '#555'
  }

  return (
    <div style={{ fontFamily: 'monospace', padding: 16, maxWidth: 960 }}>
      <h2 style={{ marginBottom: 12 }}>Room: {roomId}</h2>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ position: 'relative' }}>
          <span style={labelStyle}>You</span>
          <video
            ref={localRef}
            autoPlay
            muted
            playsInline
            style={{ width: 240, background: '#111', display: 'block' }}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <span style={labelStyle}>Remote</span>
          <video
            ref={remoteRef}
            autoPlay
            playsInline
            style={{ width: 480, background: '#111', display: 'block' }}
            onCanPlay={(e) => {
              const el = e.currentTarget
              if (el.paused) void el.play().catch(() => {})
            }}
          />
        </div>
      </div>

      {/* Diagnostic panel */}
      <div
        style={{
          background: '#f4f4f4',
          border: '1px solid #ccc',
          borderRadius: 6,
          padding: 12,
          marginBottom: 16,
          fontSize: 12,
        }}
      >
        <strong style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
          Diagnostics
        </strong>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            {(
              [
                ['WS', connected ? 'connected' : 'disconnected'],
                [
                  'Role',
                  diag.polite === null
                    ? '—'
                    : diag.polite
                      ? 'polite (joiner)'
                      : 'impolite (existing)',
                ],
                ['Remote peer ID', diag.remotePeerId ?? '—'],
                ['PC state', diag.pcConnection],
                ['ICE connection', diag.iceConnection],
                ['ICE gathering', diag.iceGathering],
                ['Signaling state', diag.signalingState],
                ['Candidates sent', String(diag.candidatesSent)],
                ['Candidates recv', String(diag.candidatesRecv)],
                ['ontrack fires', String(diag.trackCount)],
              ] as [string, string][]
            ).map(([k, v]) => (
              <tr key={k}>
                <td
                  style={{
                    paddingRight: 24,
                    paddingBottom: 3,
                    color: '#666',
                    width: 160,
                  }}
                >
                  {k}
                </td>
                <td
                  style={{
                    paddingBottom: 3,
                    fontWeight: 600,
                    color: stateColor(v),
                  }}
                >
                  {v}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Contextual hints */}
        {diag.candidatesSent === 0 && diag.signalingState !== '—' && (
          <p style={hintStyle}>
            ⚠ No ICE candidates sent. Camera/mic may be denied, or tracks
            weren't added before negotiation. Open browser console and look for
            getUserMedia errors.
          </p>
        )}
        {diag.iceConnection === 'failed' && (
          <p style={hintStyle}>
            ⚠ ICE failed. Both peers exchanged candidates but couldn't reach
            each other. On a LAN with HTTPS, Chrome uses mDNS-obfuscated
            candidates — check that mDNS is not blocked on your network. A TURN
            server is needed if peers are on different networks.
          </p>
        )}
        {diag.pcConnection === 'connected' && diag.trackCount === 0 && (
          <p style={hintStyle}>
            ⚠ ICE connected but ontrack never fired. The remote peer either has
            no camera tracks, or they were not added to the PeerConnection
            before the offer was created.
          </p>
        )}
        {diag.candidatesRecv === 0 && diag.candidatesSent > 0 && (
          <p style={hintStyle}>
            ⚠ Sent candidates but received none from the remote peer. The remote
            peer may have a getUserMedia failure or its WS is not relaying
            candidates.
          </p>
        )}
      </div>

      <Chat messages={messages} onSend={sendChat} />
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  position: 'absolute',
  top: 6,
  left: 6,
  background: 'rgba(0,0,0,0.55)',
  color: '#fff',
  fontSize: 10,
  padding: '2px 6px',
  borderRadius: 3,
  zIndex: 1,
}

const hintStyle: React.CSSProperties = {
  marginTop: 10,
  marginBottom: 0,
  color: '#9a6000',
  fontSize: 11,
  lineHeight: 1.5,
  background: '#fff8e6',
  border: '1px solid #f0d080',
  borderRadius: 4,
  padding: '6px 8px',
}

interface ChatProps {
  messages: string[]
  onSend: (text: string) => void
}

function Chat({ messages, onSend }: ChatProps) {
  const [text, setText] = useState('')
  const submit = () => {
    const t = text.trim()
    if (!t) return
    onSend(t)
    setText('')
  }
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 6 }}>
      <div style={{ height: 160, overflow: 'auto', padding: 10, fontSize: 13 }}>
        {messages.map((m, i) => (
          <div key={i}>{m}</div>
        ))}
      </div>
      <div style={{ display: 'flex', borderTop: '1px solid #ddd' }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
          placeholder="Type a message…"
          style={{
            flex: 1,
            border: 'none',
            padding: '8px 10px',
            fontSize: 13,
            outline: 'none',
          }}
        />
        <button
          onClick={submit}
          style={{
            padding: '0 16px',
            border: 'none',
            background: '#333',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
