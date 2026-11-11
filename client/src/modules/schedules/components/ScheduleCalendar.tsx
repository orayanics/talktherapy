import type { ReactNode } from 'react'
import type { Appointment } from '#/modules/appointments/types/appointment'
import type { Slot } from '#/modules/schedules/types/slot'

import { useState } from 'react'
import { formatDate } from '#/utils/useDate'

import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ScheduleCalendar({
  start,
  days = 42,
  renderDay,
  onSelect,
  onRangeChange,
  appointments = [],
  onAppointmentClick,
  slots = [],
  onSlotClick,
  isClinician = false,
  onOpenAction,
  onOpenAcceptAction,
  onOpenCompleteAction,
}: {
  start: string
  days?: number
  renderDay?: (date: string) => ReactNode
  onSelect?: (date: string) => void
  onRangeChange?: (range: { from: string; to: string }) => void
  appointments?: Appointment[]
  onAppointmentClick?: (appointment: Appointment) => void
  slots?: Slot[]
  onSlotClick?: (slot: Slot) => void
  isClinician?: boolean
  onOpenAction?: (appointment: Appointment) => void
  onOpenAcceptAction?: (appointment: Appointment) => void
  onOpenCompleteAction?: (appointment: Appointment) => void
}) {
  const today = formatDate(new Date(), 'yyyy-MM-dd')
  const [offset, setOffset] = useState(0)
  const [selectedDate, setSelectedDate] = useState(today)
  const startDate = new Date(`${start}T00:00:00Z`)
  const anchor = new Date(
    Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      days === 7 ? startDate.getUTCDate() : 1,
    ),
  )
  if (!onRangeChange) anchor.setUTCDate(anchor.getUTCDate() + offset)
  const monday = new Date(anchor)
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7))
  const monthStart = new Date(
    Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1),
  )
  const monthEnd = new Date(
    Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + 1, 0),
  )
  const selectedAppointments = appointments.filter(
    (appointment) =>
      formatDate(appointment.slot.start_at, 'yyyy-MM-dd') === selectedDate,
  )
  const selectedSlots = slots.filter(
    (slot) => formatDate(slot.start_at, 'yyyy-MM-dd') === selectedDate,
  )
  const updatePeriod = (monthDelta: number) => {
    if (!onRangeChange) {
      setOffset(monthDelta === 0 ? 0 : offset + monthDelta * days)
      return
    }
    const nextAnchor =
      monthDelta === 0 ? new Date(`${today}T00:00:00Z`) : new Date(anchor)
    nextAnchor.setUTCMonth(nextAnchor.getUTCMonth() + monthDelta)
    const nextMonthStart = new Date(
      Date.UTC(nextAnchor.getUTCFullYear(), nextAnchor.getUTCMonth(), 1),
    )
    const nextMonthEnd = new Date(
      Date.UTC(nextAnchor.getUTCFullYear(), nextAnchor.getUTCMonth() + 1, 0),
    )
    onRangeChange({
      from: formatDate(nextMonthStart, 'yyyy-MM-dd'),
      to: formatDate(nextMonthEnd, 'yyyy-MM-dd'),
    })
  }

  return (
    <section className="overflow-hidden bg-white">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center">
          <div>
            <h3 className="font-bold my-0!">
              {formatDate(anchor, 'MMMM yyyy')}
            </h3>
            <p className="text-xs text-muted mb-0">
              {formatDate(monthStart, 'MMM d, yyyy')} –{' '}
              {formatDate(monthEnd, 'MMM d, yyyy')}
            </p>
          </div>
        </div>

        <div className="join self-start sm:self-auto">
          <button
            type="button"
            className="btn btn-flat join-item"
            aria-label="Previous period"
            onClick={() => updatePeriod(-1)}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="btn btn-flat join-item"
            onClick={() => {
              updatePeriod(0)
              setSelectedDate(today)
            }}
          >
            Today
          </button>
          <button
            type="button"
            className="btn btn-flat join-item"
            aria-label="Next period"
            onClick={() => updatePeriod(1)}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="flex flex-col border-t border-border lg:flex-row">
        <div className="min-w-0 flex-1 overflow-x-auto border-r border-border">
          <div className="grid min-w-4xl grid-cols-7 ">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div
                key={day}
                className="py-3 text-center text-xs font-bold tracking-wide uppercase"
              >
                {day}
              </div>
            ))}
            {Array.from({ length: days }, (_, i) => {
              const date = new Date(monday)
              date.setUTCDate(date.getUTCDate() + i)
              const key = formatDate(date, 'yyyy-MM-dd')
              const outsideMonth = date.getUTCMonth() !== anchor.getUTCMonth()
              const dayAppointments = appointments.filter(
                (appointment) =>
                  formatDate(appointment.slot.start_at, 'yyyy-MM-dd') === key,
              )

              return (
                <div
                  key={key}
                  className="min-h-32 overflow-hidden bg-white p-2 border-border border-l nth-[7n+1]:border-l-0 border-y"
                >
                  <button
                    type="button"
                    className={`flex p-2 items-center justify-center rounded-box text-xs font-semibold transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
                      selectedDate === key ||
                      (key === today && selectedDate === key)
                        ? 'hover:bg-primary/20 text-primary'
                        : outsideMonth
                          ? 'text-slate-400'
                          : 'text-slate-700'
                    }`}
                    aria-label={formatDate(date, 'EEEE, MMMM d, yyyy')}
                    onClick={() => {
                      setSelectedDate(key)
                      onSelect?.(key)
                    }}
                  >
                    {date.getUTCDate()}
                  </button>
                  <div className="mt-2 space-y-1 overflow-hidden text-xs">
                    {renderDay ? (
                      renderDay(key)
                    ) : (
                      <>
                        {/* TODO: Collapsible that is scrollable, remove slicing */}
                        {dayAppointments.slice(0, 3).map((appointment) => (
                          <button
                            key={appointment.id}
                            type="button"
                            className="block w-full truncate rounded px-1 py-0.5 text-left text-slate-600 hover:bg-slate-100"
                            onClick={() => onAppointmentClick?.(appointment)}
                          >
                            {appointment.patient.name}
                          </button>
                        ))}
                        {dayAppointments.length > 3 && (
                          <span className="block px-1 text-slate-400">
                            +{dayAppointments.length - 3} more
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {(appointments.length > 0 || slots.length > 0) && (
          <div className="w-full border-t border-border p-4 lg:w-80 lg:border-t-0">
            <p className="font-semibold my-0!">
              {slots.length > 0 ? 'Slots' : 'Appointments'}
            </p>
            <p className="text-xs text-muted mt-0!">
              {formatDate(
                new Date(`${selectedDate}T00:00:00Z`),
                'MMMM d, yyyy',
              )}
            </p>
            <div className="space-y-2">
              {selectedAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-box border border-border hover:border-primary"
                >
                  <button
                    type="button"
                    className="w-full text-left transition-colors px-3 py-2"
                    onClick={() => onAppointmentClick?.(appointment)}
                  >
                    <span className="block font-medium">
                      {appointment.patient.name}
                    </span>
                    <span className="block text-xs text-muted">
                      {formatDate(appointment.slot.start_at, 'MMM d, p')} ·{' '}
                      {appointment.status}
                    </span>
                  </button>
                  {isClinician && (
                    <div className="mt-2 flex gap-2">
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
              ))}
              {selectedSlots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  className="w-full rounded-box border border-border p-4 text-left hover:bg-base-200"
                  onClick={() => onSlotClick?.(slot)}
                >
                  <span className="block font-medium text-slate-900">
                    {formatDate(slot.start_at, 'p')} –{' '}
                    {formatDate(slot.end_at, 'p')}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {slot.status}
                    {slot.is_hidden ? ' · Hidden' : ''}
                  </span>
                </button>
              ))}
              {selectedAppointments.length === 0 &&
                selectedSlots.length === 0 && (
                  <p className="text-sm text-slate-500">No appointments</p>
                )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
