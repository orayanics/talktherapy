import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useSearch, useNavigate } from '@tanstack/react-router'
import { fetchSlots } from '@/api/schedule'
import BookModal from '@/modules/book/BookModal'
import useBookSlot from '@/modules/book/useBookSlot'
import { useState } from 'react'

import StateError from '@/components/State/StateError'
import StateLoading from '@/components/State/StateLoading'
import StateNull from '@/components/State/StateNull'
import Pagination from '@/components/Page/Pagination'
import { TableBase } from '@/components/Table/TableBase'
import ScheduleFilters from '@/modules/schedules/list/ScheduleFilters'
import { formatDate } from '@/utils/useDate'
import { toArray } from '@/utils/query'
import type { TBookSlot } from '@/modules/book/schema'

const searchSchema = z
  .object({
    page: z.preprocess((v) => Number(v ?? 1), z.number().positive()).default(1),

    date_from: z
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
          .map((val) => String(val).toLowerCase())
          .filter((val) => val.length > 0),
      ),
  })
  .transform((data) => ({
    ...(data.page !== 1 ? { page: data.page } : {}),
    ...(data.date_from ? { from: data.date_from } : {}),
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

  const { submit, isLoading: isBooking } = useBookSlot()
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  const openBooking = (slotId: string) => {
    setSelectedSlot(slotId)
    setIsModalOpen(true)
  }

  const handleSubmit = async (payload: TBookSlot) => {
    if (!selectedSlot) return
    await submit(selectedSlot, payload)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <ScheduleFilters
          diagnosis={diagnosis}
          from={from}
          sort={sort}
          updateSearch={updateSearch}
        />
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
              { header: 'Specialization', accessor: 'clinician_diagnosis' },
              { header: 'Status', accessor: 'status' },
              {
                header: 'Action',
                accessor: 'id',
                render: (row) => (
                  <div>
                    <button
                      className="btn btn-primary"
                      onClick={() => openBooking(row.id)}
                      disabled={row.status !== 'Free' || isBooking}
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
      <Pagination
        meta={meta}
        page={page}
        updateSearch={(next) => updateSearch({ page: next.page })}
      />
      <BookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
