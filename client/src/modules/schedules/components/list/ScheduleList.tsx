import { Link, useSearch, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchSlots } from '#/modules/schedules/api/schedules'

import StateError from '#/components/State/StateError'
import StateLoading from '#/components/State/StateLoading'
import StateNull from '#/components/State/StateNull'
import Pagination from '#/components/Page/Pagination'
import { TableBase } from '#/components/Table/TableBase'
import { formatDate } from '#/utils/useDate'

import ScheduleFilters from './ScheduleFilters'
import AppointmentPill from '#/modules/appointments/components/AppointmentPill'
import { useAuthGuard } from '#/modules/auth/hooks/useAuth'
import { CircleCheck, CircleX, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import SlotDetailsDrawer from './SlotDetailsDrawer'

export default function ScheduleList() {
  const { role } = useAuthGuard()
  const search = useSearch({ from: '/_private/(clinician)/schedules/' })
  const navigate = useNavigate({ from: '/schedules/' })

  const page = search.page ?? 1
  const from = search.from
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
    fetchSlots({ page }, { from, sort }),
  )

  const slots = data?.data ?? []
  const meta = data?.meta ?? {
    current_page: 1,
    last_page: 1,
    total: 0,
    from: null,
    per_page: 0,
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <ScheduleFilters from={from} sort={sort} updateSearch={updateSearch} />
        {role === 'clinician' && (
          <Link to="/schedules/create" className="btn btn-neutral">
            Create Schedule
          </Link>
        )}
      </div>
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {isLoading ? (
          <StateLoading message="Loading slots..." />
        ) : isError ? (
          <StateError
            title="Slots unavailable"
            message="We couldn't load the slot list. Please try again."
          />
        ) : slots.length === 0 ? (
          <StateNull
            title="No slots found"
            message="No slots match the selected filters."
          />
        ) : (
          <TableBase
            data={slots}
            keyExtractor={(u) => u.id}
            columns={[
              {
                header: 'No',
                accessor: 'id',
                render: (row) => (
                  <button
                    type="button"
                    className="link link-hover"
                    onClick={() => setSelectedSlotId(row.id)}
                  >
                    {slots.indexOf(row) + 1}
                  </button>
                ),
              },
              {
                header: (
                  <button
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() =>
                      updateSearch({ sort: sort === 'desc' ? 'asc' : 'desc' })
                    }
                  >
                    Date
                    {sort === 'desc' ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronUp size={14} />
                    )}
                  </button>
                ),
                accessor: 'start_at',
                render: (row) => (
                  <button
                    type="button"
                    className="link link-hover"
                    onClick={() => setSelectedSlotId(row.id)}
                  >
                    {formatDate(row.start_at)}
                  </button>
                ),
              },

              {
                header: 'Time Schedule',
                accessor: 'start_at',
                render: (row) => (
                  <button
                    type="button"
                    className="flex gap-2"
                    onClick={() => setSelectedSlotId(row.id)}
                  >
                    <div>{formatDate(row.start_at, 'p')}</div>
                    <div>to</div>
                    <div>{formatDate(row.end_at, 'p')}</div>
                  </button>
                ),
              },
              {
                header: 'Status',
                accessor: 'status',
                render: (row) => <AppointmentPill status={row.status} />,
              },
              {
                header: 'Hidden',
                accessor: 'is_hidden',
                render: (row) =>
                  row.is_hidden ? (
                    <CircleCheck className="text-emerald-600" />
                  ) : (
                    <CircleX className="text-rose-600" />
                  ),
              },
            ]}
          />
        )}
      </div>

      <Pagination
        meta={meta}
        page={page}
        updateSearch={(next) => updateSearch({ page: next.page })}
      />
      <SlotDetailsDrawer
        slotId={selectedSlotId}
        onClose={() => setSelectedSlotId(null)}
      />
    </div>
  )
}
