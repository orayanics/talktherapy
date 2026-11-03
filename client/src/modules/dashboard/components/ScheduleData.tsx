import type {
  Appointment,
  APPOINTMENT_STATUS,
} from '#/modules/appointments/types/appointment'
import { formatDate } from '#/utils/useDate'

const STATUS_COLOR_MAP: Record<APPOINTMENT_STATUS, string> = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-700',
  ACCEPTED: 'border-green-200 bg-green-50 text-green-700',
  CANCELLED: 'border-rose-200 bg-rose-50 text-rose-700',
  COMPLETED: 'border-blue-200 bg-blue-50 text-blue-700',
  REJECT: 'border-indigo-200 bg-indigo-50 text-indigo-700',
}

export default function ScheduleData({
  appointments,
}: {
  appointments: Array<Appointment>
}) {
  return (
    <div className="space-y-1" role="list">
      {appointments.map((appointment) => (
        <div
          key={appointment.id}
          role="listitem"
          className={`flex min-w-0 items-center justify-between gap-2 rounded-md border px-2 py-1.5 font-medium ${STATUS_COLOR_MAP[appointment.status]}`}
          title={`${appointment.patient.name} · ${appointment.status}`}
        >
          <span className="truncate">{appointment.patient.name}</span>
          <time className="shrink-0" dateTime={appointment.slot.start_at}>
            {formatDate(appointment.slot.start_at, 'p')}
          </time>
          <span className="sr-only">{appointment.status}</span>
        </div>
      ))}
    </div>
  )
}
