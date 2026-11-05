import { Link, useSearch, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchSlots } from '#/modules/schedules/api/schedules'

import StateError from '#/components/State/StateError'
import StateLoading from '#/components/State/StateLoading'
import { formatDate, getMonthRange } from '#/utils/useDate'

import { useAuthGuard } from '#/modules/auth/hooks/useAuth'
import { useState } from 'react'
import SlotDetailsDrawer from './SlotDetailsDrawer'
import ScheduleCalendar from '../ScheduleCalendar'

export default function ScheduleList() {
  const { role } = useAuthGuard()
  const search = useSearch({ from: '/_private/(clinician)/schedules/' })
  const navigate = useNavigate({ from: '/schedules/' })

  const page = search.page ?? 1
  const from = search.from
  const to = search.to
  const range = getMonthRange(from ?? new Date())
  const rangeFrom = from ?? range.from
  const rangeTo = to ?? range.to
  const sort = search.sort ?? 'asc'
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  const updateSearch = (next: Partial<typeof search>) => {
    navigate({
      search: (prev) => ({
        ...prev,
        ...next,
      }),
    })
  }
  const { data, isLoading, isError } = useQuery(
    fetchSlots({ page, per_page: 100 }, { from: rangeFrom, to: rangeTo, sort }),
  )
  const slots = data?.data ?? []

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {role === 'clinician' && (
          <Link to="/schedules/create" className="btn btn-neutral">
            Create Schedule
          </Link>
        )}
      </div>
      <div className="overflow-hidden flex flex-col">
        {isLoading ? (
          <StateLoading message="Loading slots..." />
        ) : isError ? (
          <StateError
            title="Slots unavailable"
            message="We couldn't load the slot list. Please try again."
          />
        ) : (
          <>
            <ScheduleCalendar
              key={`${rangeFrom}-${rangeTo}`}
              start={rangeFrom}
              slots={slots}
              onSlotClick={(slot) => setSelectedSlotId(slot.id)}
              onRangeChange={({ from: nextFrom, to: nextTo }) =>
                updateSearch({ page: 1, from: nextFrom, to: nextTo })
              }
              renderDay={(date) => (
                <div className="space-y-1">
                  {slots
                    .filter(
                      (slot) =>
                        formatDate(slot.start_at, 'yyyy-MM-dd') === date,
                    )
                    .map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        className="block w-full truncate rounded px-1 py-0.5 text-left text-slate-600 hover:bg-slate-100"
                        onClick={() => setSelectedSlotId(slot.id)}
                      >
                        {formatDate(slot.start_at, 'p')} · {slot.status}
                      </button>
                    ))}
                </div>
              )}
            />
          </>
        )}
      </div>

      <SlotDetailsDrawer
        slotId={selectedSlotId}
        onClose={() => setSelectedSlotId(null)}
      />
    </div>
  )
}
