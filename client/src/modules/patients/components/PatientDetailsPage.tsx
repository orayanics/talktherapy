import { Link, useNavigate, useSearch, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchSoapsByPatient } from '#/modules/soaps/api/soaps'
import StateLoading from '#/components/State/StateLoading'
import StateError from '#/components/State/StateError'
import StateNull from '#/components/State/StateNull'
import { TableBase } from '#/components/Table/TableBase'
import Pagination from '#/components/Page/Pagination'
import { formatDate } from '#/utils/useDate'
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'

export default function PatientDetailsPage() {
  const search = useSearch({
    from: '/_private/(clinician)/patients/$patientId/',
  })
  const navigate = useNavigate({ from: '/patients/$patientId/' })
  const patientId = useParams({
    from: '/_private/(clinician)/patients/$patientId/',
  }).patientId
  const page = search.page ?? 1
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
    fetchSoapsByPatient(patientId, { page }, { sort }),
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
      <div className="flex justify-between">
        <Link
          to="/patients"
          className="flex gap-2 items-center link link-hover text-slate-600"
        >
          <ArrowLeft size={16} />
          Patients
        </Link>

        <Link
          to="/patients/$patientId/create"
          params={{ patientId: String(patientId) }}
          className="btn btn-neutral"
        >
          Create SOAP
        </Link>
      </div>

      <div className="bg-white rounded-box border border-slate-200  overflow-hidden flex flex-col p-4">
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
                accessor: 'createdAt',
                render: (row) => formatDate(row.createdAt),
              },
              {
                header: 'Clinician',
                accessor: 'clinician',
                render: (row) => row.clinician.name,
              },
              {
                header: 'Session Type',
                accessor: 'session_type',
              },
              {
                header: 'Activity Plan',
                accessor: 'activity_plan',
              },
              {
                header: 'Actions',
                accessor: 'id',
                render: (row) => (
                  <div className="flex gap-2">
                    <Link
                      to="/patients/$patientId/soap/$soapId"
                      params={{ soapId: row.id, patientId }}
                      className="btn btn-neutral btn-soft"
                    >
                      View
                    </Link>
                    <Link
                      to="/patients/$patientId/soap/$soapId/update"
                      params={{ soapId: row.id, patientId }}
                      className="btn btn-neutral"
                    >
                      Edit
                    </Link>
                  </div>
                ),
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
