import { Link, useSearch, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchSlots } from '@/api/schedule'

import StateError from '@/components/State/StateError'
import StateLoading from '@/components/State/StateLoading'
import StateNull from '@/components/State/StateNull'
import Pagination from '@/components/Page/Pagination'
import { TableBase } from '@/components/Table/TableBase'
import { formatDate } from '@/utils/useDate'

import ScheduleFilters from './ScheduleFilters'
import AppointmentPill from '@/components/Decorator/AppointmentPill'
import { CircleCheck, CircleX, ChevronDown, ChevronUp } from 'lucide-react'

export default function ScheduleList() {
  const search = useSearch({ from: '/_private/(clinician)/schedules/' })
  const navigate = useNavigate({ from: '/schedules/' })

  const page = search.page ?? 1
  const from = search.from
  const sort = search.sort ?? 'asc'

  const updateSearch = (next: Record<string, unknown>) => {
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
  const meta =
    data?.meta ??
    ({
      current_page: 1,
      last_page: 1,
      total: 0,
      from: null,
      per_page: 0,
    } as any)

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <ScheduleFilters from={from} sort={sort} updateSearch={updateSearch} />
        <Link to="/schedules/create" className="btn btn-neutral">
          Create Schedule
        </Link>
      </div>
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {isLoading ? (
          <StateLoading />
        ) : isError ? (
          <StateError />
        ) : slots.length === 0 ? (
          <StateNull />
        ) : (
          <TableBase
            data={slots}
            keyExtractor={(u) => u.id}
            columns={[
              {
                header: 'No',
                accessor: 'id',
                render: (row) => (
                  <Link to="/schedules/$slotId" params={{ slotId: row.id }}>
                    {slots.indexOf(row) + 1}
                  </Link>
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
                accessor: 'startAt',
                render: (row) => (
                  <Link to="/schedules/$slotId" params={{ slotId: row.id }}>
                    {formatDate(row.startAt)}
                  </Link>
                ),
              },

              {
                header: 'Time Schedule',
                accessor: 'startAt',
                render: (row) => (
                  <Link
                    to="/schedules/$slotId"
                    params={{ slotId: row.id }}
                    className="flex gap-2"
                  >
                    <div>{formatDate(row.startAt, 'p')}</div>
                    <div>to</div>
                    <div>{formatDate(row.endAt, 'p')}</div>
                  </Link>
                ),
              },
              {
                header: 'Status',
                accessor: 'status',
                render: (row) => <AppointmentPill status={row.status} />,
              },
              {
                header: 'Hidden',
                accessor: 'isHidden',
                render: (row) =>
                  row.isHidden ? (
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
    </div>
  )
}
