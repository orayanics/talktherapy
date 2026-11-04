import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useSearch, useNavigate } from '@tanstack/react-router'
import { fetchSlots } from '#/modules/schedules/api/schedules'
import BookModal from '#/modules/book/components/BookModal'
import useBookSlot from '#/modules/book/hooks/useBookSlot'
import { useState } from 'react'
import ScheduleCalendar from '#/components/ScheduleCalendar'

import StateError from '#/components/State/StateError'
import StateLoading from '#/components/State/StateLoading'
import StateNull from '#/components/State/StateNull'
import Pagination from '#/components/Page/Pagination'
import { TableBase } from '#/components/Table/TableBase'
import ScheduleFilters from '#/modules/schedules/components/list/ScheduleFilters'
import { formatDate } from '#/utils/useDate'
import { toArray } from '#/utils/query'
import type { TBookSlot } from '#/modules/book/types/schema'

const searchSchema = z
  .object({
    page: z.preprocess((v) => Number(v ?? 1), z.number().positive()).default(1),

    from: z
      .string()
      .optional()
      .transform((v) => (v && v.trim() !== '' ? v.trim() : undefined)),

    sort: z
      .string()
      .optional()
      .transform((v) => v?.toLowerCase())
      .refine((v) => !v || v === 'asc' || v === 'desc')
      .transform((v) => (v === 'asc' || v === 'desc' ? v : undefined)),
    diagnosis: z
      .any()
      .optional()
      .transform((v) =>
        toArray(v)
          .map((val) => String(val))
          .filter((val) => val.length > 0),
      ),
  })
  .transform((data) => ({
    ...(data.page !== 1 ? { page: data.page } : {}),
    ...(data.from ? { from: data.from } : {}),
    ...(data.sort ? { sort: data.sort } : {}),
    ...(data.diagnosis.length ? { diagnosis: data.diagnosis } : {}),
  }))

export const Route = createFileRoute('/_private/(patient)/book')({
  validateSearch: (search) => searchSchema.parse(search),
  component: RouteComponent,
})

function RouteComponent() {
  const search = useSearch({ from: '/_private/(patient)/book' })
  const navigate = useNavigate({ from: '/book' })

  const page = search.page ?? 1
  const from = search.from
  const sort = search.sort
  const diagnosis = search.diagnosis
    ? Array.isArray(search.diagnosis)
      ? search.diagnosis
      : [search.diagnosis]
    : []
  const updateSearch = (next: Record<string, unknown>) => {
    navigate({
      search: (prev) => ({
        ...prev,
        ...next,
      }),
    })
  }

  const { data, isLoading, isError } = useQuery(
    fetchSlots({ page }, { from, sort, diagnosis }),
  )

  const { submit, reset, apiError, isLoading: isBooking } = useBookSlot()
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const slots = data?.data ?? []
  const daySlots = slots.filter(
    (slot) => formatDate(slot.start_at, 'yyyy-MM-dd') === selectedDate,
  )
  const meta =
    data?.meta ??
    ({
      current_page: 1,
      last_page: 1,
      total: 0,
      from: null,
      per_page: 0,
    } as any)

  const openBooking = (slotId: string) => {
    setSelectedSlot(slotId)
    setIsModalOpen(true)
  }

  const handleSubmit = async (payload: TBookSlot) => {
    if (!selectedSlot) return
    await submit(selectedSlot, payload)
  }

  const closeBooking = () => {
    setIsModalOpen(false)
    setSelectedSlot(null)
    reset()
  }

  return (
    <div className="drawer drawer-end">
      <input
        id="booking-calendar-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={Boolean(selectedDate)}
        onChange={(event) => {
          if (!event.target.checked) setSelectedDate(null)
        }}
      />
      <div className="drawer-content min-w-0 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <ScheduleFilters
            diagnosis={diagnosis}
            from={from}
            sort={sort}
            updateSearch={updateSearch}
          />
        </div>
        <ScheduleCalendar
          start={from ?? formatDate(new Date(), 'yyyy-MM-dd')}
          onSelect={setSelectedDate}
          renderDay={(date) => (
            <span className="opacity-60">
              {slots.filter(
                (slot) => formatDate(slot.start_at, 'yyyy-MM-dd') === date,
              ).length || '—'}{' '}
              slots on this page
            </span>
          )}
        />
        <p className="text-sm opacity-60">
          Select a date to view available sessions. Calendar counts reflect the
          current results page.
        </p>
        <Pagination
          meta={meta}
          page={page}
          updateSearch={(next) => updateSearch({ page: next.page })}
        />
      </div>
      <div className="drawer-side z-40">
        <label
          htmlFor="booking-calendar-drawer"
          aria-label="Close available sessions"
          className="drawer-overlay"
        />
        <aside
          className="bg-base-100 text-base-content min-h-full w-[min(36rem,100vw)] p-4"
          aria-label="Available sessions"
          onKeyDown={(event) => {
            if (event.key === 'Escape') setSelectedDate(null)
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold">Sessions · {selectedDate}</h2>
            <button
              className="btn btn-sm"
              onClick={() => setSelectedDate(null)}
            >
              Close
            </button>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {isLoading ? (
              <StateLoading />
            ) : isError ? (
              <StateError />
            ) : daySlots.length === 0 ? (
              <StateNull />
            ) : (
              <TableBase
                data={daySlots}
                keyExtractor={(u) => u.id}
                columns={[
                  {
                    header: 'No',
                    accessor: 'id',
                    render: (row) => slots.indexOf(row) + 1,
                  },
                  {
                    header: 'Date',
                    accessor: 'start_at',
                    render: (row) => formatDate(row.start_at, 'PP'),
                  },
                  {
                    header: 'Time',
                    accessor: 'start_at',
                    render: (row) => (
                      <div className="flex gap-2">
                        <div>{formatDate(row.start_at, 'p')}</div>
                        <div>to</div>
                        <div>{formatDate(row.end_at, 'p')}</div>
                      </div>
                    ),
                  },
                  {
                    header: 'Specialization',
                    accessor: 'clinician',
                    render: (row) =>
                      row.clinician.diagnosis?.label ?? 'Not specified',
                  },
                  { header: 'Status', accessor: 'status' },
                  {
                    header: 'Action',
                    accessor: 'id',
                    render: (row) => (
                      <div>
                        <button
                          className="btn btn-primary"
                          onClick={() => openBooking(row.id)}
                          disabled={row.status !== 'FREE' || isBooking}
                        >
                          Book
                        </button>
                      </div>
                    ),
                  },
                ]}
              />
            )}
          </div>
        </aside>
      </div>
      <BookModal
        isOpen={isModalOpen}
        onClose={closeBooking}
        onSubmit={handleSubmit}
        apiError={apiError}
      />
    </div>
  )
}
