import { useState } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchSoapsByPatient } from '#/modules/soaps/api/soaps'
import Drawer from '#/components/Drawer'
import StateLoading from '#/components/State/StateLoading'
import StateError from '#/components/State/StateError'
import StateNull from '#/components/State/StateNull'
import { TableBase } from '#/components/Table/TableBase'
import Pagination from '#/components/Page/Pagination'
import { formatDate } from '#/utils/useDate'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useSession } from '#/modules/auth/context/SessionContext'
import SoapDetails from './SoapDetails'

export default function PatientRecordsPage() {
  const session = useSession()
  const search = useSearch({ from: '/_private/(patient)/records/' })
  const navigate = useNavigate({ from: '/records/' })
  const [selectedSoapId, setSelectedSoapId] = useState<string | null>(null)

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

  const patientId = session.id

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
      <div className="overflow-hidden">
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
              { header: 'Session Type', accessor: 'session_type' },
              { header: 'Activity Plan', accessor: 'activity_plan' },
              {
                header: 'Actions',
                accessor: 'id',
                render: (row) => (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn btn-neutral"
                      onClick={() => setSelectedSoapId(row.id)}
                    >
                      View
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

      <Drawer
        isOpen={Boolean(selectedSoapId)}
        onClose={() => setSelectedSoapId(null)}
        label="SOAP record details"
        title="Record Details"
        className={selectedSoapId ? 'fixed inset-0 z-40' : 'hidden'}
        panelClassName="min-h-full w-full max-w-lg overflow-y-auto bg-base-100 text-base-content"
      >
        {selectedSoapId && (
          <div className="p-6">
            <SoapDetails soapId={selectedSoapId} />
          </div>
        )}
      </Drawer>
    </div>
  )
}
