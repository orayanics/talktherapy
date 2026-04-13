import type { APPOINTMENT_STATUS, SLOT_STATUS } from '@/api/schedule'

const STATUS_STYLE_MAP: Partial<
  Record<APPOINTMENT_STATUS | SLOT_STATUS, string>
> = {
  FREE: 'bg-slate-50 text-slate-700 border-slate-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  ACCEPTED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
  COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200',
  REJECT: 'bg-indigo-50 text-indigo-700 border-indigo-200',
}

const DEFAULT_STATUS_STYLE = 'bg-slate-50 text-slate-700 border-slate-200'

export default function AppointmentPill({ status }: { status: string }) {
  const normalized = status as APPOINTMENT_STATUS | SLOT_STATUS

  const classes = STATUS_STYLE_MAP[normalized] ?? DEFAULT_STATUS_STYLE

  return (
    <span className={`badge badge-sm font-bold border ${classes}`}>
      {status}
    </span>
  )
}
