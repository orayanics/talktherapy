import StatCard from './StatCard'

import type { USER_ROLE } from '#/modules/auth/types/account'

const STAT_STYLE_MAP: Record<USER_ROLE, { pill: string; dot: string }> = {
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

const STAT_LABEL_MAP: Record<USER_ROLE, string> = {
  admin: 'Admin',
  superadmin: 'Sudo',
  patient: 'Patient',
  clinician: 'Clinician',
}

const isUserRole = (status: string): status is USER_ROLE =>
  Object.prototype.hasOwnProperty.call(STAT_STYLE_MAP, status)

const getStatStyle = (status: string) =>
  STAT_STYLE_MAP[isUserRole(status) ? status : 'patient']

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
  const knownStatus = isUserRole(parsedRole) ? parsedRole : undefined

  return (
    <StatCard
      label={
        label ??
        (knownStatus
          ? STAT_LABEL_MAP[knownStatus].toUpperCase()
          : role.toUpperCase())
      }
      count={count}
      textClassName={style.pill}
      dotClassName={style.dot}
      showIcon={showIcon}
      className={className}
    />
  )
}
