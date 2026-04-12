import { z } from 'zod'
import {
  createFileRoute,
  Link,
  useSearch,
  useNavigate,
} from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchLogs } from '@/api/logs'
import { TableBase } from '@/components/Table/TableBase'
import { formatDate } from '@/utils/useDate'
import LogDetail from '@/modules/logs/LogDetail'
import RolePill from '@/components/Decorator/RolePill'
import Pagination from '@/components/Page/Pagination'
import LogsFilters from '@/modules/logs/LogsFilters'
import { ChevronDown, ChevronUp } from 'lucide-react'

import StateError from '@/components/State/StateError'
import StateLoading from '@/components/State/StateLoading'
import StateNull from '@/components/State/StateNull'

const searchSchema = z
  .object({
    page: z.preprocess((v) => Number(v ?? 1), z.number().positive()).default(1),

    search: z
      .string()
      .optional()
      .transform((v) => (v ? v.trim() : '')),

    date_from: z
      .string()
      .optional()
      .transform((v) => (v && v.trim() !== '' ? v.trim() : undefined)),

    date_to: z
      .string()
      .optional()
      .transform((v) => (v && v.trim() !== '' ? v.trim() : undefined)),

    per_page: z
      .preprocess((v) => Number(v ?? 10), z.number().positive())
      .optional()
      .transform((v) =>
        v && Number.isFinite(v) ? Math.min(200, Math.floor(v)) : undefined,
      ),

    sort: z
      .string()
      .optional()
      .transform((v) => v?.toLowerCase())
      .refine((v) => !v || v === 'asc' || v === 'desc')
      .transform((v) => (v === 'asc' || v === 'desc' ? v : undefined)),
  })
  .transform((data) => ({
    ...(data.page !== 1 ? { page: data.page } : {}),
    ...(data.search ? { search: data.search } : {}),
    ...(data.date_from ? { date_from: data.date_from } : {}),
    ...(data.date_to ? { date_to: data.date_to } : {}),
    ...(data.sort ? { sort: data.sort } : {}),
    ...(data.per_page ? { per_page: data.per_page } : {}),
  }))

export const Route = createFileRoute('/_private/(adm-shared)/logs')({
  validateSearch: (search) => searchSchema.parse(search),
  component: RouteComponent,
})

function RouteComponent() {
  const search = useSearch({ from: '/_private/(adm-shared)/logs' })
  const navigate = useNavigate({ from: '/logs' })

  const page = search.page ?? 1
  const searchTerm = search.search ?? ''
  const date_from = search.date_from ?? ''
  const date_to = search.date_to ?? ''
  const sort = search.sort ?? 'desc'
  const per_page = Number(search.per_page ?? 10)

  const updateSearch = (next: Record<string, unknown>) => {
    navigate({
      search: (prev) => ({
        ...prev,
        ...next,
      }),
    })
  }

  const { data, isPending, isError } = useQuery(
    fetchLogs(
      { page },
      {
        search: searchTerm || undefined,
        date_from: date_from || undefined,
        date_to: date_to || undefined,
        sort,
        per_page,
      },
    ),
  )

  const logs = data?.data ?? []
  const meta = data?.meta ?? {
    current_page: 1,
    last_page: 1,
    total: 0,
    from: null,
    to: null,
    per_page: 0,
  }

  return (
    <div>
      <div className="mb-4">
        <LogsFilters
          searchTerm={searchTerm}
          date_from={date_from}
          date_to={date_to}
          per_page={per_page}
          updateSearch={(next) => updateSearch(next)}
        />
      </div>

      {isPending ? (
        <StateLoading />
      ) : isError ? (
        <StateError />
      ) : logs.length === 0 ? (
        <StateNull />
      ) : (
        <div
          className="bg-white
        border border-slate-300 rounded-lg p-4
        "
        >
          <TableBase
            data={logs}
            keyExtractor={(row) => row.id}
            columns={[
              {
                header: 'Actor Email',
                accessor: 'actorEmail',

                render: (row) => (
                  <Link to="/users/$userId" params={{ userId: row.actorId }}>
                    {row.actorEmail}
                  </Link>
                ),
              },
              {
                header: 'Actor Role',
                accessor: 'actorRole',
                render: (row) => <RolePill role={row.actorRole} />,
              },
              { header: 'Action', accessor: 'action' },
              {
                header: 'Details',
                accessor: 'details',
                render: (row) => (
                  <pre>
                    <LogDetail details={row.details} />
                  </pre>
                ),
              },
              {
                header: (
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => {
                      updateSearch({
                        page: 1,
                        sort: sort === 'asc' ? 'desc' : 'asc',
                      })
                    }}
                  >
                    Created{' '}
                    {sort === 'asc' ? (
                      <ChevronUp strokeWidth={3} size={16} />
                    ) : (
                      <ChevronDown strokeWidth={3} size={16} />
                    )}
                  </div>
                ),
                accessor: 'createdAt',
                render: (row) =>
                  formatDate(row.createdAt, 'dd MMM yyyy, HH:mm'),
              },
            ]}
          />
        </div>
      )}

      <Pagination
        meta={meta}
        page={page}
        updateSearch={(next) => updateSearch({ page: next.page })}
      />
    </div>
  )
}
