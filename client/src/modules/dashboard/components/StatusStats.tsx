import StatCard from './StatCard'

type StatStatus =
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
    <StatCard
      label={
        label ??
        (knownStatus
          ? STAT_LABEL_MAP[knownStatus].toUpperCase()
          : status.toUpperCase())
      }
      count={count}
      textClassName={style.pill}
      dotClassName={style.dot}
      showIcon={showIcon}
      className={className}
    />
  )
}
