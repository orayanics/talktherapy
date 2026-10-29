import { useEffect, useRef, useState } from 'react'
import { useRoomSession } from '#/modules/session/hooks/useRoomSession'
import {
  SquareArrowRight,
  MessageCircle,
  Mic,
  MicOff,
  Video,
  VideoOff,
} from 'lucide-react'
import RoomWaiting from './room/RoomWaiting'
import RoomPrompt from './room/RoomPrompt'
import RoomDenied from './room/RoomDenied'
import RoomChat from './room/RoomChat'
import { Link } from '@tanstack/react-router'

interface RoomSessionProps {
  roomId: string
}

export default function RoomSession({ roomId }: RoomSessionProps) {
  const {
    localRef,
    remoteRef,
    messages,
    sessionError,
    permission,
    hasPeer,
    micEnabled,
    cameraEnabled,
    peerMedia,
    toggleMic,
    toggleCamera,
    sendChat,
  } = useRoomSession(roomId)

  const [chatOpen, setChatOpen] = useState(false)
  const chatTriggerRef = useRef<HTMLButtonElement>(null)
  const chatCloseRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (chatOpen) chatCloseRef.current?.focus()
  }, [chatOpen])

  useEffect(() => {
    if (!chatOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setChatOpen(false)
        chatTriggerRef.current?.focus()
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [chatOpen])

  if (permission === 'prompting') {
    return <RoomPrompt roomId={roomId} />
  }

  if (permission === 'denied' || permission === 'insecure') {
    return <RoomDenied />
  }

  return (
    <div className="flex h-screen w-screen bg-white overflow-hidden relative">
      {sessionError && (
        <div
          role="alert"
          className="alert alert-error absolute mx-auto top-2 inset-x-0 z-50 w-fit"
        >
          {sessionError}
        </div>
      )}
      {/* Main Video Area */}
      <main className="flex-1 right-0 left-0 relative flex items-center justify-center overflow-hidden">
        {/* Remote Video (Full Screen) */}
        <div className="absolute inset-0 bg-white">
          <video
            ref={remoteRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {!hasPeer && <RoomWaiting />}
        </div>

        {/* Remote Peer Status Overlay */}
        {hasPeer && (
          <div className="absolute top-6 left-6 flex flex-col gap-2 z-20">
            {(!peerMedia.camera || !peerMedia.mic) && (
              <div className="flex gap-2 mt-1">
                {!peerMedia.camera && (
                  <div className="badge badge-error badge-sm gap-1">
                    <VideoOff size={16} /> Off
                  </div>
                )}
                {!peerMedia.mic && (
                  <div className="badge badge-error badge-sm gap-1">
                    <Mic size={16} /> Muted
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Local Video (Floating PiP) */}
        <div className="absolute top-6 right-6 md:top-8 md:right-8 z-20 w-32 md:w-48 xl:w-60 aspect-3/4 md:aspect-video rounded-lg shadow-lg overflow-hidden border border-base-100/30 bg-white">
          <video
            ref={localRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover scale-x-[-1]"
          />
          <div className="absolute bottom-2 left-2 flex gap-1">
            {!cameraEnabled && (
              <span className="p-2 rounded-full bg-black/60 shadow-lg text-white">
                <VideoOff />
              </span>
            )}
            {!micEnabled && (
              <span className="p-2 rounded-full bg-black/60 shadow-lg text-white">
                <MicOff />
              </span>
            )}
          </div>
        </div>

        {/* Controls Overlay (FaceTime Style) */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 hover:bottom-12">
          <div className="rounded-full px-6 py-4 flex items-center gap-5 shadow-lg border border-slate-200 backdrop-blur-xl">
            <button
              onClick={toggleMic}
              aria-label={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
              aria-pressed={!micEnabled}
              className={`btn btn-circle btn-lg border border-slate-200/60 shadow-lg shadow-slate-300 ${micEnabled ? 'bg-base-200/90 hover:bg-base-200 text-base-content' : 'bg-error text-error-content hover:bg-error/80'}`}
              title={micEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {micEnabled ? <Mic /> : <MicOff />}
            </button>
            <button
              onClick={toggleCamera}
              aria-label={cameraEnabled ? 'Turn camera off' : 'Turn camera on'}
              aria-pressed={!cameraEnabled}
              className={`btn btn-circle btn-lg border border-slate-200/60 shadow-lg shadow-slate-300  ${cameraEnabled ? 'bg-base-200/90 hover:bg-base-200 text-base-content' : 'bg-error text-error-content hover:bg-error/80'}`}
              title={cameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {cameraEnabled ? <Video /> : <VideoOff />}
            </button>

            <Link
              to="/dashboard"
              className="btn btn-circle btn-lg border border-slate-200/60 shadow-lg shadow-slate-300"
              title="Exit to Dashboard"
              aria-label="Exit to dashboard"
            >
              <SquareArrowRight size={20} />
            </Link>
            <div className="w-px h-10 bg-base-content/20 mx-1"></div>
            <button
              onClick={() => setChatOpen((v) => !v)}
              ref={chatTriggerRef}
              aria-label={chatOpen ? 'Close chat' : 'Open chat'}
              aria-expanded={chatOpen}
              className={`btn btn-circle btn-lg border border-slate-200/60 shadow-lg shadow-slate-300 transition-colors ${chatOpen ? 'bg-primary text-primary-content hover:bg-primary/80' : 'bg-base-200/90 hover:bg-base-200 text-base-content'}`}
              title="Toggle Chat"
            >
              <MessageCircle />
            </button>
          </div>
        </div>
      </main>

      <RoomChat
        messages={messages}
        onSend={sendChat}
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        closeButtonRef={chatCloseRef}
      />
    </div>
  )
}
