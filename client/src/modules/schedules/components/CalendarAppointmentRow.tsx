import type { Appointment } from '#/modules/appointments/types/appointment'
import { formatDate } from '#/utils/useDate'

export default function CalendarAppointmentRow({
  onAppointmentClick,
  appointment,
  isClinician,
  onOpenAcceptAction,
  onOpenAction,
  onOpenCompleteAction,
}: {
  onAppointmentClick: ((appointment: Appointment) => void) | undefined
  appointment: Appointment
  isClinician: boolean
  onOpenAcceptAction: ((appointment: Appointment) => void) | undefined
  onOpenAction: ((appointment: Appointment) => void) | undefined
  onOpenCompleteAction: ((appointment: Appointment) => void) | undefined
}) {
  return (
    <div className="rounded-box border border-border hover:border-primary">
      <button
        type="button"
        className="w-full text-left transition-colors px-3 py-2"
        onClick={() => onAppointmentClick?.(appointment)}
      >
        <span className="block font-medium">{appointment.patient.name}</span>
        <span className="block text-xs text-muted">
          {formatDate(appointment.slot.start_at, 'MMM d, p')} ·{' '}
          {appointment.status}
        </span>
      </button>
      {isClinician && (
        <div className="flex gap-2 p-2">
          {appointment.status === 'PENDING' && (
            <>
              <button
                type="button"
                className="btn btn-xs btn-neutral"
                onClick={() => onOpenAcceptAction?.(appointment)}
              >
                Accept
              </button>
              <button
                type="button"
                className="btn btn-xs btn-error"
                onClick={() => onOpenAction?.(appointment)}
              >
                Reject
              </button>
            </>
          )}
          {appointment.status === 'ACCEPTED' && (
            <button
              type="button"
              className="btn btn-xs btn-success"
              onClick={() => onOpenCompleteAction?.(appointment)}
            >
              Complete
            </button>
          )}
        </div>
      )}
    </div>
  )
}
