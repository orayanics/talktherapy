import { cn } from '#/lib/cn'

export type StatStatus =
  'free' | 'pending' | 'accepted' | 'reject' | 'cancelled' | 'completed'

const STAT_STYLE_MAP: Record<StatStatus, { pill: string; dot: string }> = {
  free: { pill: 'text-sky-700', dot: 'bg-sky-500' },
  pending: {
    pill: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  accepted: {
    pill: 'text-green-700',
    dot: 'bg-green-500',
  },
  reject: {
    pill: 'text-red-700',
    dot: 'bg-red-500',
  },
  cancelled: {
    pill: 'text-slate-700',
    dot: 'bg-slate-500',
  },
  completed: {
    pill: 'text-indigo-700',
    dot: 'bg-indigo-500',
  },
}

const STAT_LABEL_MAP: Record<StatStatus, string> = {
  free: 'FREE',
  pending: 'PENDING',
  accepted: 'ACCEPTED',
  reject: 'REJECT',
  cancelled: 'CANCELLED',
  completed: 'COMPLETED',
}

const isStatStatus = (status: string): status is StatStatus =>
  Object.prototype.hasOwnProperty.call(STAT_STYLE_MAP, status)

const getStatStyle = (status: string) =>
  STAT_STYLE_MAP[isStatStatus(status) ? status : 'free']

const DOT_OPACITY = ['opacity-100', 'opacity-70', 'opacity-40', 'opacity-20']

export function DotGridIcon({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  const style = getStatStyle(status)

  return (
    <div className={cn('grid grid-cols-2 gap-0.5 w-fit', className)}>
      {DOT_OPACITY.map((opacity, i) => (
        <span
          key={i}
          className={cn('size-2 rounded-full', style.dot, opacity)}
        />
      ))}
    </div>
  )
}

type StatusStatProps = {
  status: string
  count: number
  label?: string
  showIcon?: boolean
  className?: string
}

export function StatusStat({
  status,
  count,
  label,
  showIcon = false,
  className,
}: StatusStatProps) {
  const parsedStatus = status.toLowerCase()
  const style = getStatStyle(parsedStatus)
  const knownStatus = isStatStatus(parsedStatus) ? parsedStatus : undefined

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg border border-border px-4 py-2 text-xs font-medium',
        style.pill,
        className,
      )}
    >
      <span>
        {label ??
          (knownStatus
            ? STAT_LABEL_MAP[knownStatus].toUpperCase()
            : status.toUpperCase())}
      </span>

      <div className="inline-flex justify-between">
        {showIcon && <DotGridIcon status={parsedStatus} />}
        <span className="text-xl font-semibold leading-none">{count}</span>
      </div>
    </div>
  )
}

type StatusStatListProps = {
  counts: Partial<Record<StatStatus, number>>
  order?: StatStatus[]
  showIcon?: boolean
}

export function StatusStatList({
  counts,
  order = ['free', 'pending', 'accepted', 'reject', 'cancelled', 'completed'],
  showIcon,
}: StatusStatListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {order.map((status) => (
        <StatusStat
          key={status}
          status={status}
          count={counts[status] ?? 0}
          showIcon={showIcon}
        />
      ))}
    </div>
  )
}
