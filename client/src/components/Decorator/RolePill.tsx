import type { USER_ROLE } from '@/types/account'

const STATUS_STYLE_MAP: Partial<Record<USER_ROLE, string>> = {
  superadmin: 'bg-green-50 text-green-700 border-green-200',
  admin: 'bg-rose-50 text-rose-700 border-rose-200',
  clinician: 'bg-amber-50 text-amber-700 border-amber-200',
  patient: 'bg-sky-50 text-sky-700 border-sky-200',
}

const DEFAULT_STATUS_STYLE = 'bg-slate-50 text-slate-700 border-slate-200'

function isUserRole(value: string): value is USER_ROLE {
  return value in STATUS_STYLE_MAP
}

export default function RolePill({ role }: { role?: string }) {
  const normalized = role ?? ''

  const classes = isUserRole(normalized as USER_ROLE)
    ? STATUS_STYLE_MAP[normalized as USER_ROLE]
    : DEFAULT_STATUS_STYLE

  return (
    <span className={`badge badge-sm font-bold border uppercase ${classes}`}>
      {role ?? 'UNKNOWN'}
    </span>
  )
}
