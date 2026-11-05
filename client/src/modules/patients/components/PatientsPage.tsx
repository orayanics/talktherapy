import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchClinicianPatients } from '#/modules/patients/api/patients'
import StateLoading from '#/components/State/StateLoading'
import StateError from '#/components/State/StateError'
import StateNull from '#/components/State/StateNull'
import { TableBase } from '#/components/Table/TableBase'
import { formatDate } from '#/utils/useDate'
import Pagination from '#/components/Page/Pagination'
import CpFilters from '#/modules/patients/components/CpFilters'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function PatientsPage() {
  const search = useSearch({ from: '/_private/(clinician)/patients/' })
  const navigate = useNavigate({ from: '/patients/' })

  const page = search.page ?? 1
  const searchTerm = search.search ?? ''
  const sort = search.sort ?? 'desc'

  const updateSearch = (next: Partial<typeof search>) => {
    navigate({
      search: (prev) => ({
        ...prev,
        ...next,
      }),
    })
  }

  const { data, isPending, isError } = useQuery(
    fetchClinicianPatients({ page }, { search: searchTerm || undefined, sort }),
  )

  const records = data?.data ?? []
  const meta = data?.meta ?? {
    current_page: 1,
    last_page: 1,
    total: 0,
    from: null,
    to: null,
    per_page: 0,
  }

  return (
    <div className="space-y-4">
      <CpFilters searchTerm={searchTerm} updateSearch={updateSearch} />

      <div className="bg-white rounded-box border border-slate-200 shadow-sm overflow-hidden flex flex-col p-4">
        {isPending ? (
          <StateLoading />
        ) : isError ? (
          <StateError />
        ) : records.length == 0 ? (
          <StateNull />
        ) : (
          <TableBase
            data={records}
            columns={[
              {
                header: 'Patient',
                accessor: 'patient',
                render: (row) => (
                  <Link
                    to="/patients/$patientId"
                    params={{ patientId: row.patient.id }}
                  >
                    {row.patient.name}
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
                    First Completed
                    {sort === 'desc' ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronUp size={14} />
                    )}
                  </button>
                ),
                accessor: 'firstCompletedAt',
                render: (row) => formatDate(row.firstCompletedAt),
              },
            ]}
          />
        )}

        <Pagination
          meta={meta}
          page={page}
          updateSearch={(next) => updateSearch({ page: next.page })}
        />
      </div>
    </div>
  )
}
