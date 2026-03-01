import type { SlotAppointmentEvent } from '~/models/schedule'
import { formatToLocalDate, getTime } from '~/utils/date'

/**
 * Event types whose reason field is relevant and shown to patients.
 * Clinicians can see reason for every event type.
 */
const PATIENT_VISIBLE_REASON_TYPES = new Set(['CANCELLED', 'RESCHEDULED'])

const EVENT_TYPE_LABEL: Record<string, string> = {
  BOOKED: 'Booked',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  RESCHEDULED: 'Rescheduled',
  COMPLETED: 'Completed',
  NO_SHOW: 'No Show',
}

const EVENT_TYPE_BADGE: Record<string, string> = {
  BOOKED: 'badge badge-outline bg-blue-50 text-blue-700 border-blue-200',
  CONFIRMED: 'badge badge-outline bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'badge badge-outline bg-red-50 text-red-700 border-red-200',
  RESCHEDULED:
    'badge badge-outline bg-yellow-50 text-yellow-700 border-yellow-200',
  COMPLETED: 'badge badge-outline bg-green-50 text-green-700 border-green-200',
  NO_SHOW: 'badge badge-outline bg-gray-50 text-gray-700 border-gray-200',
}

const ACTOR_TYPE_LABEL: Record<string, string> = {
  PATIENT: 'Patient',
  CLINICIAN: 'Clinician',
  SYSTEM: 'System',
  ADMIN: 'Admin',
}

interface AppointmentEventHistoryProps {
  events: Array<SlotAppointmentEvent>
  /**
   * 'clinician' – all reasons shown for every event
   * 'patient'   – reason shown only for CANCELLED and RESCHEDULED events
   */
  variant: 'clinician' | 'patient'
}

export default function AppointmentEventHistory({
  events,
  variant,
}: AppointmentEventHistoryProps) {
  if (events.length === 0) {
    return <p className="text-sm text-gray-400 py-2">No events recorded yet.</p>
  }

  return (
    <ol className="relative border-l border-dashed border-gray-200 ml-1 space-y-4 pl-6">
      {events.map((event) => {
        const showReason =
          variant === 'clinician' ||
          PATIENT_VISIBLE_REASON_TYPES.has(event.type)

        const date = formatToLocalDate(event.created_at)
        const time = getTime(event.created_at)
        const actorLabel =
          ACTOR_TYPE_LABEL[event.actor_type] ?? event.actor_type
        const typeLabel = EVENT_TYPE_LABEL[event.type] ?? event.type
        const badgeClass = EVENT_TYPE_BADGE[event.type] ?? 'badge badge-outline'

        return (
          <li key={event.id} className="relative">
            {/* timeline dot */}
            <span className="absolute -left-7.5 mt-1 flex h-3 w-3 items-center justify-center rounded-full border-2 border-white bg-gray-300" />

            <div className="flex flex-col gap-1">
              <div className="flex flex-row flex-wrap items-center gap-2">
                <span className={badgeClass}>{typeLabel}</span>
                <span className="text-xs text-gray-400">
                  by {actorLabel} · {date} {time}
                </span>
              </div>

              {showReason && event.reason && (
                <p className="text-sm text-gray-600 bg-gray-50 rounded px-3 py-2 border border-gray-100">
                  <span className="font-medium text-gray-700">Reason: </span>
                  {event.reason}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
