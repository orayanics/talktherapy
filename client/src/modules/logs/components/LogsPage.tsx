import { Link, useSearch, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchLogs } from '#/modules/logs/api/logs'
import { TableBase } from '#/components/Table/TableBase'
import { formatDate } from '#/utils/useDate'
import LogDetail from '#/modules/logs/components/LogDetail'
import RolePill from '#/modules/users/components/RolePill'
import Pagination from '#/components/Page/Pagination'
import LogsFilters from '#/modules/logs/components/LogsFilters'
import { ChevronDown, ChevronUp } from 'lucide-react'
import StateError from '#/components/State/StateError'
import StateLoading from '#/components/State/StateLoading'
import StateNull from '#/components/State/StateNull'

export default function LogsPage() {
  const search = useSearch({ from: '/_private/(adm-shared)/logs' })
  const navigate = useNavigate({ from: '/logs' })

  const page = search.page ?? 1
  const searchTerm = search.search ?? ''
  const date_from = search.date_from ?? ''
  const date_to = search.date_to ?? ''
  const sort = search.sort ?? 'desc'
  const per_page = Number(search.per_page ?? 10)

  const updateSearch = (next: Partial<typeof search>) => {
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
        border border-slate-300 rounded-box p-4
        "
        >
          <TableBase
            data={logs}
            keyExtractor={(row) => row.id}
            columns={[
              {
                header: 'Actor Email',
                accessor: 'actorEmail',

                render: (row) =>
                  row.actorId ? (
                    <Link to="/users" search={{ search: row.actorEmail }}>
                      {row.actorEmail || 'Deleted actor'}
                    </Link>
                  ) : (
                    row.actorEmail || 'Deleted actor'
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
