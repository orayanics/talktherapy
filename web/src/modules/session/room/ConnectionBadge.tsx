import type { RTCConnectionState } from '~/hooks/useWebRTC'
import type { SocketStatus } from '~/hooks/useSessionSocket'

type ConnectionState = SocketStatus | RTCConnectionState

interface BadgeConfig {
  label: string
  cls: string
}

const BADGE_CONFIG: Record<string, BadgeConfig> = {
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
} as const

const FALLBACK_CONFIG: BadgeConfig = { label: 'Unknown', cls: 'badge-neutral' }

interface ConnectionBadgeProps {
  state: ConnectionState | string
}

export default function ConnectionBadge({ state }: ConnectionBadgeProps) {
  const { label, cls } = BADGE_CONFIG[state] ?? FALLBACK_CONFIG

  return (
    <span className={`badge badge-soft badge-sm ${cls} font-mono`}>
      {label}
    </span>
  )
}
