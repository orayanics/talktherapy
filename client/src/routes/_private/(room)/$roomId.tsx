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
    let destroyed = false
    const abort = new AbortController()

    async function start() {
      if (!roomId) return

      const API_BASE = `${location.protocol}//${location.hostname}:8080`
      const res = await fetch(`${API_BASE}/appointments/${roomId}/join-token`, {
        method: 'POST',
        credentials: 'include',
        signal: abort.signal,
      })

      if (destroyed) return

      if (!res.ok) {
        console.error('[rtc] Failed to get join token', await res.text())
        return
      }

      const { token } = await res.json()
      const wsProto = location.protocol === 'https:' ? 'wss' : 'ws'
      const wssUrl = `${wsProto}://${location.hostname}:8080/session/ws?token=${encodeURIComponent(token)}`

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
        ],
      })
      pcRef.current = pc

      pc.onconnectionstatechange = () => {
        console.log('[rtc] connectionState', pc.connectionState)
        patchDiag({ pcConnection: pc.connectionState })
      }

      pc.onsignalingstatechange = () => {
        console.log('[rtc] signalingState', pc.signalingState)
        patchDiag({ signalingState: pc.signalingState })
      }

      pc.oniceconnectionstatechange = () => {
        console.log('[rtc] iceConnectionState', pc.iceConnectionState)
        patchDiag({ iceConnection: pc.iceConnectionState })
        if (pc.iceConnectionState === 'failed') {
          console.warn('[rtc] ICE failed — calling restartIce()')
          pc.restartIce()
        }
      }

      pc.onicegatheringstatechange = () => {
        console.log('[rtc] iceGatheringState', pc.iceGatheringState)
        patchDiag({ iceGathering: pc.iceGatheringState })
      }

      pc.ontrack = (ev) => {
        console.log(
          '[rtc] ontrack',
          ev.track.kind,
          'streams:',
          ev.streams.length,
        )
        setDiag((prev) => ({ ...prev, trackCount: prev.trackCount + 1 }))

        const videoEl = remoteRef.current
        if (!videoEl) return

        if (ev.streams?.[0]) {
          if (videoEl.srcObject !== ev.streams[0]) {
            videoEl.srcObject = ev.streams[0]
          }
        } else {
          if (!(videoEl.srcObject instanceof MediaStream)) {
            videoEl.srcObject = new MediaStream()
          }
          ;(videoEl.srcObject as MediaStream).addTrack(ev.track)
        }

        if (videoEl.paused) {
          void videoEl.play().catch((e) => {
            console.warn('[rtc] remote video autoplay blocked', e)
          })
        }
      }

      const bindDataChannel = (channel: RTCDataChannel) => {
        dcRef.current = channel
        channel.onopen = () => console.log('[rtc] data channel open')
        channel.onmessage = (e: MessageEvent<string>) =>
          setMessages((m) => [...m, `Peer: ${e.data}`])
        channel.onclose = () => {
          if (dcRef.current === channel) dcRef.current = null
        }
      }

      pc.ondatachannel = (ev) => bindDataChannel(ev.channel)

      pc.onicecandidate = (ev) => {
        if (!ev.candidate) {
          console.log('[rtc] ICE gathering complete (null candidate)')
          return
        }
        console.log(
          '[rtc] local candidate',
          ev.candidate.type,
          ev.candidate.address,
        )
        const ws = wsRef.current
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: 'candidate',
              payload: ev.candidate.toJSON(),
            }),
          )
          setDiag((prev) => ({
            ...prev,
            candidatesSent: prev.candidatesSent + 1,
          }))
        }
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        })
        if (destroyed) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        localStreamRef.current = stream
        if (localRef.current) localRef.current.srcObject = stream
        for (const track of stream.getTracks()) pc.addTrack(track, stream)
        console.log(
          '[rtc] local tracks added:',
          stream.getTracks().map((t) => t.kind),
        )
      } catch (e) {
        console.warn('[rtc] getUserMedia failed', e)
      }

      const ws = new WebSocket(wssUrl)
      wsRef.current = ws

      let polite = false
      let makingOffer = false
      let ignoreOffer = false
      let negotiatePending = false
      let remotePeerId: string | null = null

      const ensureDataChannel = () => {
        if (dcRef.current) return
        bindDataChannel(pc.createDataChannel('chat'))
      }

      const negotiate = async () => {
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
          const offer = await pc.createOffer()
          await pc.setLocalDescription(offer)
          ws.send(JSON.stringify({ type: 'offer', payload: offer }))
          console.log('[rtc] sent offer to', remotePeerId)
        } catch (e) {
          console.warn('[rtc] negotiate failed', e)
        } finally {
          makingOffer = false
          if (negotiatePending) void negotiate()
        }
      }

      const flushPendingCandidates = async () => {
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

      ws.onopen = () => {
        if (destroyed) {
          ws.close()
          return
        }
        setConnected(true)
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
        if (!msg?.type) return

        switch (msg.type as string) {
          case 'joined': {
            ;(pc as any).__peerId = msg.peerId
            const existingPeers: { peerId: string }[] = Array.isArray(
              msg.existingPeers,
            )
              ? msg.existingPeers
              : []
            polite = existingPeers.length > 0
            if (existingPeers.length > 0) {
              remotePeerId = existingPeers[0].peerId
            }
            patchDiag({ polite, remotePeerId })
            console.log('[ws] joined', {
              self: msg.peerId,
              polite,
              remotePeerId,
              existingPeers,
            })
            break
          }

          case 'peer-joined': {
            if (!remotePeerId) remotePeerId = msg.peerId ?? null
            patchDiag({ remotePeerId })
            console.log('[ws] peer-joined', msg.peerId, '— polite:', polite)
            if (!polite) await negotiate()
            break
          }

          case 'peer-left': {
            if (msg.peerId === remotePeerId) {
              remotePeerId = null
              pendingCandidatesRef.current = []
              ignoreOffer = false
              dcRef.current?.close()
              dcRef.current = null
              patchDiag({ remotePeerId: null })
              console.log('[ws] remote peer left', msg.peerId)
            }
            break
          }

          case 'offer': {
            if (!remotePeerId && msg.from) remotePeerId = msg.from as string
            if (msg.from && msg.from !== remotePeerId) return

            const offerCollision = makingOffer || pc.signalingState !== 'stable'
            ignoreOffer = !polite && offerCollision
            if (ignoreOffer) {
              console.log('[rtc] ignoring collided offer (impolite peer)')
              return
            }

            console.log('[rtc] received offer from', msg.from, '— applying')
            await pc.setRemoteDescription(
              new RTCSessionDescription(msg.payload),
            )
            await flushPendingCandidates()
            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)
            ws.send(JSON.stringify({ type: 'answer', payload: answer }))
            ignoreOffer = false
            console.log('[rtc] sent answer to', msg.from)
            break
          }

          case 'answer': {
            if (!remotePeerId && msg.from) remotePeerId = msg.from as string
            if (msg.from && msg.from !== remotePeerId) return

            console.log('[rtc] received answer from', msg.from)
            await pc.setRemoteDescription(
              new RTCSessionDescription(msg.payload),
            )
            await flushPendingCandidates()
            ignoreOffer = false
            break
          }

          case 'candidate': {
            if (ignoreOffer) return
            if (!remotePeerId && msg.from) remotePeerId = msg.from as string
            if (msg.from && msg.from !== remotePeerId) return

            setDiag((prev) => ({
              ...prev,
              candidatesRecv: prev.candidatesRecv + 1,
            }))
            console.log(
              '[rtc] remote candidate, remoteDesc set:',
              !!pc.remoteDescription,
            )

            if (pc.remoteDescription) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(msg.payload))
              } catch (e) {
                console.warn('[rtc] addIceCandidate failed', e)
              }
            } else {
              pendingCandidatesRef.current.push(msg.payload)
            }
            break
          }

          case 'chat':
          case 'message': {
            if (remotePeerId && msg.from && msg.from !== remotePeerId) return
            const text = (msg.message ?? msg.payload) as string
            setMessages((m) => [...m, `Peer: ${text}`])
            break
          }
        }
      }

      ws.onclose = () => {
        console.log('[ws] closed')
        setConnected(false)
      }

      ws.onerror = (e) => console.error('[ws] error', e)
    }

    start().catch((e: unknown) => {
      if (e instanceof Error && e.name === 'AbortError') return
      console.error('[rtc] fatal error', e)
    })

    return () => {
      destroyed = true
      abort.abort()
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
      ws.send(JSON.stringify({ type: 'chat', message: text }))
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
