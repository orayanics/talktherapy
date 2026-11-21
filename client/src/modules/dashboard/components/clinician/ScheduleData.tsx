import type {
Appointment,
APPOINTMENT_STATUS,
} from '#/modules/appointments/types/appointment'

export const STATUS_COLOR_MAP: Record<APPOINTMENT_STATUS, string> = {
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
    <div className="space-y-2">
      {appointments.map((appointment) => (
        <ScheduleAppointmentButton
          key={appointment.id}
          appointment={appointment}
          onAppointmentClick={onAppointmentClick}
        />
      ))}
    </div>
  )
}

import ScheduleAppointmentButton from './ScheduleAppointmentButton'
