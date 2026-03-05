import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  BsCameraVideoFill,
  BsCameraVideoOffFill,
  BsChatDotsFill,
  BsMicFill,
  BsMicMuteFill,
} from 'react-icons/bs'
import { MdCallEnd } from 'react-icons/md'
import { RiWifiOffLine } from 'react-icons/ri'

import type { ClientMessage } from '~/models/session'
import { useSession } from '~/context/SessionContext'
import { useSessionSocket } from '~/hooks/useSessionSocket'
import { useWebRTC } from '~/hooks/useWebRTC'

export const Route = createFileRoute('/_private/(room)/$roomId')({
  component: SessionRoom,
})

interface VideoTileProps {
  stream: MediaStream | null
  label: string
  muted?: boolean
  mirrored?: boolean
  noCamera?: boolean
  className?: string
}

function VideoTile({
  stream,
  label,
  muted = false,
  mirrored = false,
  noCamera = false,
  className = '',
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    if (stream) {
      el.srcObject = stream
    } else {
      el.srcObject = null
    }
  }, [stream])

  return (
    <div
      className={`relative flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden ${className}`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`w-full h-full object-cover ${mirrored ? 'scale-x-[-1]' : ''} ${noCamera || !stream ? 'hidden' : ''}`}
      />

      {(noCamera || !stream) && (
        <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-2xl font-bold text-gray-300">
            {label.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium">{label}</span>
        </div>
      )}

      <div className="absolute bottom-3 left-3 text-xs bg-black/50 text-white px-2 py-1 rounded-lg backdrop-blur-sm">
        {label}
      </div>
    </div>
  )
}

interface ChatPanelProps {
  messages: Array<{
    id: string
    from: string
    role: 'clinician' | 'patient'
    text: string
    timestamp: string
    isSelf: boolean
  }>
  onSend: (text: string) => void
  className?: string
}

function ChatPanel({ messages, onSend, className = '' }: ChatPanelProps) {
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const submit = () => {
    const text = draft.trim()
    if (!text) return
    onSend(text)
    setDraft('')
  }

  return (
    <div
      className={`flex flex-col bg-white border-l border-gray-200 ${className}`}
    >
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
        <BsChatDotsFill className="text-primary" size={16} />
        <span className="text-gray-700 font-semibold text-sm">
          Session Chat
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-500 text-xs mt-8">
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-0.5 ${msg.isSelf ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed wrap-break-word ${
                msg.isSelf
                  ? 'bg-primary text-primary-content rounded-br-sm'
                  : 'bg-gray-200 text-gray-700 rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[10px] text-gray-500">
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="p-3 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message…"
            className="input input-sm flex-1 text-white placeholder-gray-500 focus:border-primary text-xs"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
          />
          <button
            className="btn btn-sm btn-primary"
            onClick={submit}
            disabled={!draft.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

function ConnectionBadge({ state }: { state: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    connecting: { label: 'Connecting…', cls: 'badge-warning' },
    open: { label: 'Signalling', cls: 'badge-info' },
    closed: { label: 'Disconnected', cls: 'badge-error' },
    error: { label: 'Error', cls: 'badge-error' },
    connected: { label: 'Live', cls: 'badge-success' },
    connecting_rtc: { label: 'Establishing…', cls: 'badge-warning' },
    failed: { label: 'Failed', cls: 'badge-error' },
    disconnected: { label: 'Reconnecting…', cls: 'badge-warning' },
    new: { label: 'Initialising…', cls: 'badge-neutral' },
    idle: { label: 'Waiting…', cls: 'badge-neutral' },
  }
  const { label, cls } = config[state] ?? { label: state, cls: 'badge-neutral' }
  return <span className={`badge badge-sm ${cls} font-mono`}>{label}</span>
}

function SessionRoom() {
  const { roomId } = Route.useParams()
  const session = useSession()
  const navigate = useNavigate()
  const [chatOpen, setChatOpen] = useState(true)

  const isPatient = session.account_role === 'patient'

  // Stable send ref — populated once socketSend is available
  const sendRef = useRef<((msg: ClientMessage) => void) | null>(null)

  const sendStable = useCallback(
    (msg: ClientMessage) => sendRef.current?.(msg),
    [],
  )

  // ── WebRTC ──────────────────────────────────────────────────────────────────
  const {
    localStream,
    remoteStream,
    connectionState,
    cameraEnabled,
    micEnabled,
    toggleCamera,
    toggleMic,
    handlePeerReady,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
  } = useWebRTC({ polite: isPatient, send: sendStable })

  // ── Session WebSocket ────────────────────────────────────────────────────────
  const {
    status: wsStatus,
    participants,
    chatMessages,
    peerMediaState,
    send: socketSend,
  } = useSessionSocket({
    roomId,
    userId: session.id,
    onPeerReady: handlePeerReady,
    onOffer: handleOffer,
    onAnswer: handleAnswer,
    onIceCandidate: handleIceCandidate,
  })

  // Wire socket send into the stable ref
  useEffect(() => {
    sendRef.current = socketSend
  }, [socketSend])

  // Signal readiness once WS is open AND local media is acquired.
  // Waiting for localStream ensures our RTCPeerConnection is already set up,
  // so when the other peer receives this and calls handlePeerReady(), our PC
  // is guaranteed to be ready to create an answer/offer.
  useEffect(() => {
    if (wsStatus === 'open' && localStream) {
      socketSend({ type: 'peer:ready' })
    }
  }, [wsStatus, localStream, socketSend])

  // ── Send chat ─────────────────────────────────────────────────────────────────
  const sendChat = useCallback(
    (text: string) => socketSend({ type: 'chat:message', text }),
    [socketSend],
  )

  // ── End call ──────────────────────────────────────────────────────────────────
  const endCall = useCallback(() => {
    localStream?.getTracks().forEach((t) => t.stop())
    void navigate({ to: '/dashboard' })
  }, [localStream, navigate])

  const hasPeer = participants.some((p) => p.userId !== session.id)
  const peer = participants.find((p) => p.userId !== session.id)
  const peerLabel = peer
    ? peer.role === 'clinician'
      ? 'Clinician'
      : 'Patient'
    : 'Participant'
  const localLabel = isPatient ? 'You (Patient)' : 'You (Clinician)'

  // ── Disconnected / error state ──────────────────────────────────────────────
  if (wsStatus === 'error' || wsStatus === 'closed') {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col items-center justify-center gap-6">
        <RiWifiOffLine size={52} className="text-error" />
        <div className="text-center">
          <p className="text-white text-xl font-semibold">
            Session Disconnected
          </p>
          <p className="text-gray-400 text-sm mt-1">
            The connection to the session room was lost.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Reconnect
          </button>
          <button
            className="btn btn-ghost text-gray-300"
            onClick={() => void navigate({ to: '/dashboard' })}
          >
            Leave
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col select-none">
      <header className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <ConnectionBadge
            state={wsStatus === 'open' ? connectionState : wsStatus}
          />
          <span className="text-gray-700 text-xs font-mono">
            #{roomId.slice(0, 8)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {participants.map((p) => (
              <div
                key={p.userId}
                className="flex items-center gap-1 bg-gray-800 px-2 py-0.5 rounded-full text-xs text-gray-300"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    p.role === 'clinician' ? 'bg-primary' : 'bg-secondary'
                  }`}
                />
                {p.role === 'clinician' ? 'Clinician' : 'Patient'}
                {p.userId === session.id && ' (you)'}
              </div>
            ))}
          </div>

          <button
            className={`btn btn-sm btn-ghost text-gray-300 gap-1 ${chatOpen ? 'bg-gray-700' : ''}`}
            onClick={() => setChatOpen((o) => !o)}
            title="Toggle chat"
          >
            <BsChatDotsFill size={15} />
            {chatMessages.length > 0 && (
              <span className="badge badge-xs badge-primary">
                {chatMessages.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Video */}
        <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden">
          {!hasPeer ? (
            <div className="flex flex-col items-center gap-5 text-center">
              <div className="loading loading-ring loading-lg text-primary" />
              <div>
                <p className="text-gray-700 text-lg font-semibold">
                  Waiting for the other participant…
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Share Room ID{' '}
                  <span className="font-mono text-primary">
                    #{roomId.slice(0, 8)}
                  </span>{' '}
                  with your {isPatient ? 'clinician' : 'patient'}.
                </p>
              </div>
            </div>
          ) : (
            <VideoTile
              stream={remoteStream}
              label={peerLabel}
              noCamera={!peerMediaState.camera}
              className="w-full h-full"
            />
          )}

          {/* Peer muted indicator */}
          {hasPeer && !peerMediaState.mic && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm pointer-events-none">
              <BsMicMuteFill className="text-error" size={12} />
              {peerLabel} is muted
            </div>
          )}

          {/* Local PiP */}
          <div className="absolute bottom-6 right-6 w-44 h-32 shadow-2xl rounded-xl overflow-hidden border hover:border-primary transition-colors cursor-default">
            <VideoTile
              stream={localStream}
              label={localLabel}
              muted
              mirrored
              noCamera={!cameraEnabled}
              className="w-full h-full"
            />
          </div>
        </div>

        {chatOpen && (
          <ChatPanel
            messages={chatMessages}
            onSend={sendChat}
            className="w-72 shrink-0"
          />
        )}
      </div>

      <footer className="flex items-center justify-center gap-5 px-6 py-4 bg-gray-50 border-t border-gray-200 shrink-0">
        <button
          className={`btn btn-circle btn-md border transition-all ${
            micEnabled
              ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600'
              : 'btn-primary border-transparent'
          }`}
          onClick={toggleMic}
          title={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          {micEnabled ? <BsMicFill size={18} /> : <BsMicMuteFill size={18} />}
        </button>

        <button
          className={`btn btn-circle btn-md border transition-all ${
            cameraEnabled
              ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600'
              : 'btn-primary border-transparent'
          }`}
          onClick={toggleCamera}
          title={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {cameraEnabled ? (
            <BsCameraVideoFill size={18} />
          ) : (
            <BsCameraVideoOffFill size={18} />
          )}
        </button>

        <button
          className="btn btn-circle btn-md btn-error shadow-lg shadow-error/30 hover:shadow-error/50 transition-all scale-110"
          onClick={endCall}
          title="End session"
        >
          <MdCallEnd size={22} />
        </button>
      </footer>
    </div>
  )
}
