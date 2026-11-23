import type { Event } from '#/modules/appointments/types/appointment'
import RolePill from '#/modules/users/components/RolePill'
import { formatDate } from '#/utils/useDate'

export default function AppointmentHistoryEntry({ event }: { event: Event }) {
  return (
    <div className="group relative pl-8">
      <div className="absolute -left-1.75 h-3 w-3 rounded-full border-2 border-primary bg-white " />

      <div className="flex flex-col gap-1">
        <time className="text-xs uppercase text-muted">
          {formatDate(event.created_at)}
        </time>

        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold capitalize my-0!">
            {event.to_status.toLowerCase().replace('_', ' ')}
          </h4>
          <span className="text-muted">•</span>
          <RolePill role={event.actor_type} />
        </div>

        {event.reason && (
          <div className="rounded-box border border-border bg-slate-50 p-4">
            <p className="text-xs leading-relaxed uppercase font-bold my-0!">
              Reason
            </p>
            <p className="leading-relaxed my-0!">{event.reason}</p>
          </div>
        )}
      </div>
    </div>
  )
}
