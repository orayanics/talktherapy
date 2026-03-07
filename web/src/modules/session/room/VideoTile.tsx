import { User } from 'lucide-react'
import { useEffect, useRef } from 'react'

export interface VideoTileProps {
  stream: MediaStream | null
  label: string
  /** Mute the audio track — should always be true for the local stream. */
  muted?: boolean
  /** Horizontally flip the video — used for the local self-view PiP. */
  mirrored?: boolean
  /** Override to force the placeholder even when a stream is present. */
  noCamera?: boolean
  className?: string
}

export default function VideoTile({
  stream,
  label,
  muted = false,
  mirrored = false,
  noCamera = false,
  className = '',
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Attach or detach the media stream whenever it changes.
  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    el.srcObject = stream
  }, [stream])

  const showPlaceholder = noCamera || !stream

  return (
    <div
      className={`relative flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden ${className}`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={[
          'w-full h-full object-cover',
          mirrored ? 'scale-x-[-1]' : '',
          showPlaceholder ? 'hidden' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      />

      {showPlaceholder && (
        <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
          <User size={48} />
        </div>
      )}

      <div className="absolute bottom-3 left-3 text-xs bg-black/50 text-white px-2 py-1 rounded-lg backdrop-blur-sm">
        {label}
      </div>
    </div>
  )
}
