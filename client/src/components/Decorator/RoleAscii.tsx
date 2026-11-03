import { cn } from '#/lib/cn'

export type StatStatus = 'admin' | 'superadmin' | 'patient' | 'clinician'

const STAT_STYLE_MAP: Record<StatStatus, { pill: string; dot: string }> = {
  admin: { pill: 'text-sky-700', dot: 'bg-sky-500' },
  superadmin: {
    pill: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  patient: {
    pill: 'text-green-700',
    dot: 'bg-green-500',
  },
  clinician: {
    pill: 'text-red-700',
    dot: 'bg-red-500',
  },
}

const STAT_LABEL_MAP: Record<StatStatus, string> = {
  admin: 'Admin',
  superadmin: 'Sudo',
  patient: 'Patient',
  clinician: 'Clinician',
}

const isStatStatus = (status: string): status is StatStatus =>
  status in STAT_STYLE_MAP

const getStatStyle = (status: string) =>
  STAT_STYLE_MAP[isStatStatus(status) ? status : 'patient']

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

type RoleStatProps = {
  role: string
  count: number
  label?: string
  showIcon?: boolean
  className?: string
}

export function RoleStat({
  role,
  count,
  label,
  showIcon = false,
  className,
}: RoleStatProps) {
  const parsedRole = role.toLowerCase()
  const style = getStatStyle(parsedRole)
  const knownStatus = isStatStatus(parsedRole) ? parsedRole : undefined

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-md border border-border px-4 py-2 text-xs font-medium',
        style.pill,
        className,
      )}
    >
      <span>
        {label ??
          (knownStatus
            ? STAT_LABEL_MAP[knownStatus].toUpperCase()
            : role.toUpperCase())}
      </span>

      <div className="inline-flex justify-between">
        {showIcon && <DotGridIcon status={parsedRole} />}
        <span className="text-xl font-semibold leading-none">{count}</span>
      </div>
    </div>
  )
}

type RoleStatListProps = {
  counts: Partial<Record<StatStatus, number>>
  order?: StatStatus[]
  showIcon?: boolean
}

export function RoleStatList({
  counts,
  order = ['patient', 'clinician', 'admin', 'superadmin'],
  showIcon,
}: RoleStatListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {order.map((role) => (
        <RoleStat
          key={role}
          role={role}
          count={counts[role] ?? 0}
          showIcon={showIcon}
        />
      ))}
    </div>
  )
}
