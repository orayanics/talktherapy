import { useState } from 'react'
import Drawer from '#/components/Drawer'
import SoapDetails from '#/modules/soaps/components/SoapDetails'
import CreateSoapPage from '#/modules/soaps/components/CreateSoapPage'
import UpdateSoapPage from '#/modules/soaps/components/UpdateSoapPage'
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
  const [selectedSoap, setSelectedSoap] = useState<
    | {
        id: string
        mode: 'view' | 'edit'
      }
    | { mode: 'create' }
    | null
  >(null)
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

        <button
          type="button"
          onClick={() => setSelectedSoap({ mode: 'create' })}
          className="btn btn-neutral"
        >
          Create SOAP
        </button>
      </div>

      {selectedSoap && (
        <Drawer
          isOpen
          onClose={() => setSelectedSoap(null)}
          label={
            selectedSoap.mode === 'create'
              ? 'Create SOAP'
              : selectedSoap.mode === 'view'
                ? 'View SOAP'
                : 'Edit SOAP'
          }
          className="fixed inset-0 z-40"
          panelClassName="min-h-full w-full max-w-2xl overflow-y-auto bg-base-100 text-base-content"
        >
          {selectedSoap.mode === 'create' ? (
            <CreateSoapPage
              patientId={patientId}
              onClose={() => setSelectedSoap(null)}
            />
          ) : selectedSoap.mode === 'view' ? (
            <div className="p-6">
              <SoapDetails soapId={selectedSoap.id} />
            </div>
          ) : (
            <UpdateSoapPage
              key={selectedSoap.id}
              soapId={selectedSoap.id}
              onClose={() => setSelectedSoap(null)}
            />
          )}
        </Drawer>
      )}
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
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedSoap({ id: row.id, mode: 'view' })
                      }
                      className="btn btn-neutral btn-soft"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedSoap({ id: row.id, mode: 'edit' })
                      }
                      className="btn btn-neutral"
                    >
                      Edit
                    </button>
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
