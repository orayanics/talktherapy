import type { Appointment } from '#/modules/appointments/types/appointment'
import type { ReactNode } from 'react'
import { formatDate } from '#/utils/useDate'

export default function ScheduleCalendarDay({
  date,
  dateKey,
  outsideMonth,
  selected,
  appointments,
  renderDay,
  onSelect,
  onAppointmentClick,
}: {
  date: Date
  dateKey: string
  outsideMonth: boolean
  selected: boolean
  appointments: Appointment[]
  renderDay?: (date: string) => ReactNode
  onSelect?: (date: string) => void
  onAppointmentClick?: (appointment: Appointment) => void
}) {
  return (
    <div className="min-h-32 overflow-hidden bg-white p-2 border-border border-t border-l nth-[7n+1]:border-l-0">
      <button
        type="button"
        className={`flex p-2 items-center justify-center rounded-box text-xs font-semibold transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
          selected
            ? 'hover:bg-primary/20 text-primary'
            : outsideMonth
              ? 'text-slate-400'
              : 'text-slate-700'
        }`}
        aria-label={formatDate(date, 'EEEE, MMMM d, yyyy')}
        onClick={() => onSelect?.(dateKey)}
      >
        {date.getUTCDate()}
      </button>
      <div className="mt-2 space-y-1 overflow-hidden text-xs">
        {renderDay ? (
          renderDay(dateKey)
        ) : (
          <>
            {/* TODO: Collapsible that is scrollable, remove slicing */}
            {appointments.slice(0, 3).map((appointment) => (
              <button
                key={appointment.id}
                type="button"
                className="block w-full truncate rounded px-1 py-0.5 text-left text-slate-600 hover:bg-slate-100"
                onClick={() => onAppointmentClick?.(appointment)}
              >
                {appointment.patient.name}
              </button>
            ))}
            {appointments.length > 3 && (
              <span className="block px-1 text-slate-400">
                +{appointments.length - 3} more
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
