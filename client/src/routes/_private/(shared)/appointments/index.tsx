import { z } from 'zod'
import {
  createFileRoute,
  useSearch,
  useNavigate,
  Link,
} from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchAppointments } from '@/api/schedule'

import StateError from '@/components/State/StateError'
import StateLoading from '@/components/State/StateLoading'
import StateNull from '@/components/State/StateNull'
import Pagination from '@/components/Page/Pagination'
import { TableBase } from '@/components/Table/TableBase'
import ScheduleFilters from '@/modules/schedules/list/ScheduleFilters'
import { formatDate } from '@/utils/useDate'
import AppointmentActionModal from '@/modules/appointments/AppointmentActionModal'
import useAppointmentAction from '@/modules/appointments/useAppointmentAction'
import AcceptAppointmentModal from '@/modules/appointments/AcceptAppointmentModal'
import useAcceptAppointment from '@/modules/appointments/useAcceptAppointment'
import CompleteAppointmentModal from '@/modules/appointments/CompleteAppointmentModal'
import useCompleteAppointment from '@/modules/appointments/useCompleteAppointment'
import { useState } from 'react'
import { useAuthGuard } from '@/hooks/useAuth'
import AppointmentPill from '@/components/Decorator/AppointmentPill'
import { ChevronDown, ChevronUp } from 'lucide-react'

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
  })
  .transform((data) => ({
    ...(data.page !== 1 ? { page: data.page } : {}),
    ...(data.date_from ? { from: data.date_from } : {}),
    ...(data.sort ? { sort: data.sort } : {}),
  }))

export const Route = createFileRoute('/_private/(shared)/appointments/')({
  validateSearch: (search) => searchSchema.parse(search),
  component: RouteComponent,
})

function RouteComponent() {
  const { is } = useAuthGuard()
  const isClinician = is('clinician')

  const search = useSearch({ from: '/_private/(shared)/appointments/' })
  const navigate = useNavigate({ from: '/appointments/' })

  const page = search.page ?? 1
  const from = search.from
  const sort = search.sort

  const updateSearch = (next: Record<string, unknown>) => {
    navigate({ search: (prev) => ({ ...prev, ...next }) })
  }

  const { data, isLoading, isError } = useQuery(
    fetchAppointments({ page }, { from, sort }),
  )

  const { submit, apiError } = useAppointmentAction(isClinician)
  const acceptAction = useAcceptAppointment()
  const completeAction = useCompleteAppointment()
  const [selected, setSelected] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [openAccept, setOpenAccept] = useState(false)
  const [openComplete, setOpenComplete] = useState(false)

  const appointments = data?.data ?? []
  const meta =
    data?.meta ??
    ({
      current_page: 1,
      last_page: 1,
      total: 0,
      from: null,
      per_page: 0,
    } as any)

  const openAction = (id: string) => {
    setSelected(id)
    setOpen(true)
  }

  const openAcceptAction = (id: string) => {
    setSelected(id)
    setOpenAccept(true)
  }

  const openCompleteAction = (id: string) => {
    setSelected(id)
    setOpenComplete(true)
  }

  const handleSubmit = async (payload: any) => {
    if (!selected) return
    await submit(selected, payload)
  }

  const handleAcceptSubmit = async (payload?: any) => {
    if (!selected) return
    await acceptAction.submit(selected, payload)
  }

  const handleCompleteSubmit = async (payload?: any) => {
    if (!selected) return
    await completeAction.submit(selected, payload)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <ScheduleFilters from={from} updateSearch={updateSearch} />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {isLoading ? (
          <StateLoading />
        ) : isError ? (
          <StateError />
        ) : appointments.length === 0 ? (
          <StateNull />
        ) : (
          <TableBase
            data={appointments}
            keyExtractor={(u) => u.id}
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
                accessor: 'slot',
                render: (row) => (
                  <Link
                    to="/appointments/$appointmentId"
                    params={{ appointmentId: row.id }}
                  >
                    {formatDate(row.slot.startAt)}
                  </Link>
                ),
              },
              {
                header: 'Time',
                accessor: 'slot',
                render: (row) => (
                  <div className="flex gap-2">
                    <div>{formatDate(row.slot.startAt, 'p')}</div>
                    <div>to</div>
                    <div>{formatDate(row.slot.endAt, 'p')}</div>
                  </div>
                ),
              },
              {
                header: 'Patient',
                accessor: 'patient',
                render: (row) => row.patient.name,
              },
              {
                header: 'Clinician',
                accessor: 'clinician',
                render: (row) => row.clinician.name,
              },
              {
                header: 'Status',
                accessor: 'status',
                render: (row) => <AppointmentPill status={row.status} />,
              },
              {
                header: 'Action',
                accessor: 'id',
                render: (row) => {
                  if (row.status === 'PENDING') {
                    return (
                      <div className="flex gap-2">
                        {isClinician ? (
                          <>
                            <button
                              className="btn btn-neutral"
                              onClick={() => openAcceptAction(row.id)}
                            >
                              Accept
                            </button>
                            <button
                              className="btn btn-error"
                              onClick={() => openAction(row.id)}
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn btn-error"
                            onClick={() => openAction(row.id)}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    )
                  }

                  if (row.status === 'ACCEPTED') {
                    return isClinician ? (
                      <div className="flex gap-2">
                        <button
                          className="btn btn-success"
                          onClick={() => openCompleteAction(row.id)}
                        >
                          Complete
                        </button>
                      </div>
                    ) : null
                  }

                  return <p className="text-slate-600">N/A</p>
                },
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

      <AppointmentActionModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        isClinician={isClinician}
        apiError={apiError}
      />
      <AcceptAppointmentModal
        isOpen={openAccept}
        onClose={() => setOpenAccept(false)}
        onSubmit={handleAcceptSubmit}
        isClinician={isClinician}
      />
      <CompleteAppointmentModal
        isOpen={openComplete}
        onClose={() => setOpenComplete(false)}
        onSubmit={handleCompleteSubmit}
        isClinician={isClinician}
      />
    </div>
  )
}
