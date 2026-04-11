import {
  createFileRoute,
  Link,
  useNavigate,
  useSearch,
} from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { fetchClinicianPatients } from '@/api/records'
import StateLoading from '@/components/State/StateLoading'
import StateError from '@/components/State/StateError'
import StateNull from '@/components/State/StateNull'
import { TableBase } from '@/components/Table/TableBase'
import { formatDate } from '@/utils/useDate'
import Pagination from '@/components/Page/Pagination'
import CpFilters from '@/modules/patients/CpFilters'
import { ChevronDown, ChevronUp } from 'lucide-react'

const searchSchema = z
  .object({
    page: z.preprocess((v) => Number(v ?? 1), z.number().positive()).default(1),

    search: z
      .string()
      .optional()
      .transform((v) => (v ? v.trim() : '')),

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
    ...(data.sort ? { sort: data.sort } : {}),
  }))

export const Route = createFileRoute('/_private/(clinician)/patients/')({
  validateSearch: (search) => searchSchema.parse(search),
  component: RouteComponent,
})

function RouteComponent() {
  const search = useSearch({ from: '/_private/(clinician)/patients/' })
  const navigate = useNavigate({ from: '/patients/' })

  const page = search.page ?? 1
  const searchTerm = search.search ?? ''
  const sort = search.sort ?? 'desc'

  const updateSearch = <T extends Record<string, unknown>>(
    next: Partial<T>,
  ) => {
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

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col p-4">
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
                accessor: 'patient_name',
                render: (row) => (
                  <Link
                    to="/patients/$patientId"
                    params={{ patientId: row.patient_id }}
                  >
                    {row.patient_name}
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
                accessor: 'first_completed_at',
                render: (row) => formatDate(row.first_completed_at),
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
