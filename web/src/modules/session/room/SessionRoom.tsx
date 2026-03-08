import { Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react'

import ConnectionBadge from './ConnectionBadge'
import VideoTile from './VideoTile'
import ChatPanel from './ChatPanel'
import { useSessionRoom } from './useSessionRoom'
import SessionDisconnect from './SessionDisconnect'
import SessionWaiting from './SessionWaiting'

interface SessionRoomProps {
  roomId: string
}

export default function SessionRoom({ roomId }: SessionRoomProps) {
  const {
    localStream,
    remoteStream,
    connectionState,
    cameraEnabled,
    micEnabled,
    toggleCamera,
    toggleMic,
    wsStatus,
    chatMessages,
    peerMediaState,
    sendChat,
    endCall,
    hasPeer,
    peerLabel,
    localLabel,
    isPatient,
  } = useSessionRoom(roomId)

  if (wsStatus === 'error' || wsStatus === 'closed') {
    return <SessionDisconnect />
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
          <ChatPanel messages={chatMessages} onSend={sendChat} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden">
          {/* Remote PIP indicator */}
          {hasPeer ? (
            <VideoTile
              stream={remoteStream}
              label={peerLabel}
              noCamera={!peerMediaState.camera}
              className="w-full h-full"
            />
          ) : (
            <SessionWaiting roomId={roomId} isPatient={isPatient} />
          )}

          {/* Remote PIP Muted indicator */}
          {hasPeer && !peerMediaState.mic && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm pointer-events-none">
              <MicOff className="text-error" size={12} />
              {peerLabel} is muted
            </div>
          )}

          {/* Local PIP */}
          <div className="absolute bottom-6 right-6 w-44 h-32 shadow-2xl rounded-xl overflow-hidden border hover:border-primary transition-colors">
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
      </div>

      <footer className="flex items-center justify-center gap-5 px-6 py-4 bg-gray-50 border-t border-gray-200 shrink-0">
        <MicButton enabled={micEnabled} onToggle={toggleMic} />
        <CameraButton enabled={cameraEnabled} onToggle={toggleCamera} />
        <EndCallButton onEnd={endCall} />
      </footer>
    </div>
  )
}

function MicButton({
  enabled,
  onToggle,
}: {
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <button
      className={`btn btn-circle btn-md border transition-all ${
        enabled
          ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600'
          : 'btn-primary border-transparent'
      }`}
      onClick={onToggle}
    >
      {enabled ? <Mic size={18} /> : <MicOff size={18} />}
    </button>
  )
}

function CameraButton({
  enabled,
  onToggle,
}: {
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <button
      className={`btn btn-circle btn-md border transition-all ${
        enabled
          ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600'
          : 'btn-primary border-transparent'
      }`}
      onClick={onToggle}
      title={enabled ? 'Turn off camera' : 'Turn on camera'}
    >
      {enabled ? <Video size={18} /> : <VideoOff size={18} />}
    </button>
  )
}

function EndCallButton({ onEnd }: { onEnd: () => void }) {
  return (
    <button
      className="btn btn-circle btn-md btn-error shadow-lg shadow-error/30 hover:shadow-error/50 transition-all scale-110"
      onClick={onEnd}
      title="End session"
    >
      <PhoneOff size={18} />
    </button>
  )
}
