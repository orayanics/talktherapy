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
  onAppointmentClick,
}: {
  appointments: Array<Appointment>
  onAppointmentClick?: (appointment: Appointment) => void
}) {
  return (
    <div className="space-y-1">
      {appointments.map((appointment) => (
        <button
          key={appointment.id}
          type="button"
          className={`flex flex-col w-full gap-2 rounded-box border p-2 text-left  ${STATUS_COLOR_MAP[appointment.status]}`}
          title={`${appointment.patient.name} · ${appointment.status}`}
          onClick={() => onAppointmentClick?.(appointment)}
        >
          <span className="truncate">{appointment.patient.name}</span>
          <time className="shrink-0" dateTime={appointment.slot.start_at}>
            {formatDate(appointment.slot.start_at, 'p')}
          </time>
          <span className="font-bold">{appointment.status}</span>
        </button>
      ))}
    </div>
  )
}
