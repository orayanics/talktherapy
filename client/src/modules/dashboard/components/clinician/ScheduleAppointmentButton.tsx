import type { Appointment } from '#/modules/appointments/types/appointment'
import { formatDate } from '#/utils/useDate'
import { STATUS_COLOR_MAP } from './ScheduleData'

export default function ScheduleAppointmentButton({
  appointment,
  onAppointmentClick,
}: {
  appointment: Appointment
  onAppointmentClick: ((appointment: Appointment) => void) | undefined
}) {
  return (
    <button
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
  )
}
