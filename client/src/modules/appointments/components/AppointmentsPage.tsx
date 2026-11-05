import type { TAppointmentAction } from '#/modules/appointments/types/schema'
import { useSearch, useNavigate, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchAppointments } from '#/modules/appointments/api/appointments'
import StateError from '#/components/State/StateError'
import StateLoading from '#/components/State/StateLoading'
import StateNull from '#/components/State/StateNull'
import Pagination from '#/components/Page/Pagination'
import { TableBase } from '#/components/Table/TableBase'
import ScheduleFilters from '#/modules/schedules/components/list/ScheduleFilters'
import { formatDate } from '#/utils/useDate'
import AppointmentActionModal from '#/modules/appointments/components/AppointmentActionModal'
import useAppointmentAction from '#/modules/appointments/hooks/useAppointmentAction'
import AcceptAppointmentModal from '#/modules/appointments/components/AcceptAppointmentModal'
import useAcceptAppointment from '#/modules/appointments/hooks/useAcceptAppointment'
import CompleteAppointmentModal from '#/modules/appointments/components/CompleteAppointmentModal'
import useCompleteAppointment from '#/modules/appointments/hooks/useCompleteAppointment'
import { useState } from 'react'
import { useAuthGuard } from '#/modules/auth/hooks/useAuth'
import AppointmentPill from '#/modules/appointments/components/AppointmentPill'
import { ChevronDown, ChevronUp } from 'lucide-react'
import AppointmentDetailsDrawer from '#/modules/appointments/components/AppointmentDetailsDrawer'
import type { Appointment } from '#/modules/appointments/types/appointment'

export default function AppointmentsPage() {
  const { role } = useAuthGuard()
  const isClinician = role === 'clinician'

  const search = useSearch({ from: '/_private/(shared)/appointments/' })
  const navigate = useNavigate({ from: '/appointments/' })

  const page = search.page ?? 1
  const from = search.from
  const sort = search.sort
  const status = search.status

  const updateSearch = (next: Partial<typeof search>) => {
    navigate({ search: (prev) => ({ ...prev, ...next }) })
  }

  const { data, isLoading, isError } = useQuery(
    fetchAppointments({ page }, { from, sort, status }),
  )

  const {
    submit,
    reset: resetAction,
    apiError,
  } = useAppointmentAction(isClinician)
  const acceptAction = useAcceptAppointment()
  const completeAction = useCompleteAppointment()
  const [selected, setSelected] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [openAccept, setOpenAccept] = useState(false)
  const [openComplete, setOpenComplete] = useState(false)
  const [detailsAppointmentId, setDetailsAppointmentId] = useState<
    string | null
  >(null)

  const appointments = data?.data ?? []
  const meta = data?.meta ?? {
    current_page: 1,
    last_page: 1,
    total: 0,
    from: null,
    per_page: 0,
  }

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

  const handleSubmit = async (payload: TAppointmentAction) => {
    if (!selected) return
    await submit(selected, payload)
  }

  const handleAcceptSubmit = async (payload?: { is_hidden?: boolean }) => {
    if (!selected) return
    await acceptAction.submit(selected, payload)
  }

  const handleCompleteSubmit = async (payload?: { is_hidden?: boolean }) => {
    if (!selected) return
    await completeAction.submit(selected, payload)
  }

  const closeAction = () => {
    setOpen(false)
    setSelected(null)
    resetAction()
  }

  const closeAccept = () => {
    setOpenAccept(false)
    setSelected(null)
    acceptAction.reset()
  }

  const closeComplete = () => {
    setOpenComplete(false)
    setSelected(null)
    completeAction.reset()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <ScheduleFilters from={from} updateSearch={updateSearch} />
      </div>

      <div className="bg-white rounded-box border border-border overflow-hidden flex flex-col">
        {isLoading ? (
          <StateLoading message="Loading appointments..." />
        ) : isError ? (
          <StateError
            title="Appointments unavailable"
            message="We couldn't load the appointment list. Please try again."
          />
        ) : appointments.length === 0 ? (
          <StateNull
            title="No appointments found"
            message="No appointments match the selected filters."
          />
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
                  <button
                    type="button"
                    className="link link-hover"
                    onClick={() => setDetailsAppointmentId(row.id)}
                  >
                    {formatDate(row.slot.start_at, 'MMMM d, yyyy')}
                  </button>
                ),
              },
              {
                header: 'Time',
                accessor: 'slot',
                render: (row) => (
                  <div className="flex gap-2">
                    <div>{formatDate(row.slot.start_at, 'p')}</div>
                    <div>to</div>
                    <div>{formatDate(row.slot.end_at, 'p')}</div>
                  </div>
                ),
              },
              ...(isClinician
                ? [
                    {
                      header: 'Room',
                      accessor: 'room_id' as const,
                      render: (row: Appointment) =>
                        row.status === 'ACCEPTED' && row.room_id ? (
                          <Link
                            to="/room/$roomId"
                            params={{ roomId: row.id }}
                            className="btn btn-neutral"
                          >
                            Join Session
                          </Link>
                        ) : (
                          <span>N/A</span>
                        ),
                    },
                  ]
                : []),
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
              ...(isClinician
                ? [
                    {
                      header: 'Action',
                      accessor: 'id' as const,
                      render: (row: Appointment) => {
                        if (row.status === 'PENDING') {
                          return (
                            <div className="flex gap-2">
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
                            </div>
                          )
                        }

                        if (row.status === 'ACCEPTED') {
                          return (
                            <div className="flex gap-2">
                              <button
                                className="btn btn-success"
                                onClick={() => openCompleteAction(row.id)}
                              >
                                Complete
                              </button>
                            </div>
                          )
                        }

                        return <p className="text-slate-600">N/A</p>
                      },
                    },
                  ]
                : []),
            ]}
          />
        )}
      </div>

      <Pagination
        meta={meta}
        page={page}
        updateSearch={(next) => updateSearch({ page: next.page })}
      />

      <AppointmentDetailsDrawer
        appointmentId={detailsAppointmentId}
        onClose={() => setDetailsAppointmentId(null)}
      />

      <AppointmentActionModal
        isOpen={open}
        onClose={closeAction}
        onSubmit={handleSubmit}
        isClinician={isClinician}
        apiError={apiError}
      />
      <AcceptAppointmentModal
        isOpen={openAccept}
        onClose={closeAccept}
        onSubmit={handleAcceptSubmit}
        isClinician={isClinician}
        apiError={acceptAction.apiError}
      />
      <CompleteAppointmentModal
        isOpen={openComplete}
        onClose={closeComplete}
        onSubmit={handleCompleteSubmit}
        isClinician={isClinician}
        apiError={completeAction.apiError}
      />
    </div>
  )
}
