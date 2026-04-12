import type { ACCOUNT_STATUS } from '@/types/account'

const STATUS_STYLE_MAP: Partial<Record<ACCOUNT_STATUS, string>> = {
  ACTIVE: 'bg-green-50 text-green-700 border-green-200',
  INACTIVE: 'bg-rose-50 text-rose-700 border-rose-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  SUSPENDED: 'bg-slate-50 text-slate-700 border-slate-200',
}

const DEFAULT_STATUS_STYLE = 'bg-slate-50 text-slate-700 border-slate-200'

export default function StatusPill({ status }: { status: string }) {
  const normalized = status as ACCOUNT_STATUS

  const classes = STATUS_STYLE_MAP[normalized] ?? DEFAULT_STATUS_STYLE

  return (
    <span className={`badge badge-sm font-bold border ${classes}`}>
      {status}
    </span>
  )
}
