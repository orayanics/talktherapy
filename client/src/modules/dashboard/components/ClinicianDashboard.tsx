import type { TAppointmentAction } from '#/modules/appointments/types/schema'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import ScheduleCalendar from '#/modules/schedules/components/ScheduleCalendar'

import { fetchAppointments } from '#/modules/appointments/api/appointments'
import { fetchDashboardSummary } from '#/modules/dashboard/api/dashboard'

import StateLoading from '#/components/State/StateLoading'
import StateError from '#/components/State/StateError'

import { formatDate } from '#/utils/useDate'
import { Link } from '@tanstack/react-router'
import StateNull from '#/components/State/StateNull'
import { TableBase } from '#/components/Table/TableBase'
import AppointmentPill from '#/modules/appointments/components/AppointmentPill'
import AppointmentActionModal from '#/modules/appointments/components/AppointmentActionModal'
import useAppointmentAction from '#/modules/appointments/hooks/useAppointmentAction'
import AcceptAppointmentModal from '#/modules/appointments/components/AcceptAppointmentModal'
import useAcceptAppointment from '#/modules/appointments/hooks/useAcceptAppointment'
import CompleteAppointmentModal from '#/modules/appointments/components/CompleteAppointmentModal'
import useCompleteAppointment from '#/modules/appointments/hooks/useCompleteAppointment'
import ScheduleData from './clinician/ScheduleData'
import ClinicianSummary from './clinician/ClinicianSummary'
import AppointmentDetailsDrawer from '#/modules/appointments/components/AppointmentDetailsDrawer'

export default function ClinicianDashboard() {
  const [selected, setSelected] = useState<string | null>(null)
  const [openReject, setOpenReject] = useState(false)
  const [openAccept, setOpenAccept] = useState(false)
  const [openComplete, setOpenComplete] = useState(false)
  const [detailsAppointmentId, setDetailsAppointmentId] = useState<
    string | null
  >(null)

  const today = formatDate(new Date(), 'yyyy-MM-dd')
  const start = new Date(`${today}T00:00:00.000Z`)
  start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7))
  const weekFrom = formatDate(start, 'yyyy-MM-dd')
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 6)
  const weekTo = formatDate(end, 'yyyy-MM-dd')

  // shortcut: the dashboard loads at most 100 weekly appointments, paginate if weekly volume can exceed that.
  const q = useQuery(
    fetchAppointments(
      { per_page: 100 },
      { from: weekFrom, to: weekTo, sort: 'asc' },
    ),
  )
  const appointments = q.data?.data ?? []
  const todayAppointments = appointments.filter(
    (appointment) =>
      formatDate(appointment.slot.start_at, 'yyyy-MM-dd') === today,
  )

  const summaryQ = useQuery(
    fetchDashboardSummary({
      date_from: weekFrom,
      date_to: weekTo,
    }),
  )

  const {
    submit: submitReject,
    reset: resetReject,
    apiError,
  } = useAppointmentAction(true)
  const acceptAction = useAcceptAppointment()
  const completeAction = useCompleteAppointment()

  const openRejectAction = (id: string) => {
    setSelected(id)
    setOpenReject(true)
  }

  const openAcceptAction = (id: string) => {
    setSelected(id)
    setOpenAccept(true)
  }

  const openCompleteAction = (id: string) => {
    setSelected(id)
    setOpenComplete(true)
  }

  const handleRejectSubmit = async (payload: TAppointmentAction) => {
    if (!selected) return
    await submitReject(selected, payload)
  }

  const handleAcceptSubmit = async (payload?: { is_hidden?: boolean }) => {
    if (!selected) return
    await acceptAction.submit(selected, payload)
  }

  const handleCompleteSubmit = async (payload?: { is_hidden?: boolean }) => {
    if (!selected) return
    await completeAction.submit(selected, payload)
  }

  const closeReject = () => {
    setOpenReject(false)
    setSelected(null)
    resetReject()
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

  if (q.isLoading) return <StateLoading />
  if (q.isError) return <StateError />

  return (
    <div className="space-y-6">
      <ClinicianSummary summary={summaryQ.data} />
      <section className="space-y-4">
        <div>
          <p className="text-lg font-bold text-slate-900 uppercase tracking-tight">
            Schedule
          </p>
          <p className="text-xs text-slate-400 font-medium">
            Quick view of your appointments for the week.
          </p>
        </div>

        <ScheduleCalendar
          start={today}
          days={7}
          appointments={appointments}
          isClinician
          onOpenAction={(appointment) => openRejectAction(appointment.id)}
          onOpenAcceptAction={(appointment) => openAcceptAction(appointment.id)}
          onOpenCompleteAction={(appointment) =>
            openCompleteAction(appointment.id)
          }
          onAppointmentClick={(appointment) =>
            setDetailsAppointmentId(appointment.id)
          }
          renderDay={(date) => (
            <ScheduleData
              appointments={appointments.filter(
                (appointment) =>
                  formatDate(appointment.slot.start_at, 'yyyy-MM-dd') === date,
              )}
              onAppointmentClick={(appointment) =>
                setDetailsAppointmentId(appointment.id)
              }
            />
          )}
        />
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-lg font-bold text-slate-900 uppercase tracking-tight">
            Appointments
          </p>
          <p className="text-xs text-slate-400 font-medium">
            Your appointments today
          </p>
        </div>

        {todayAppointments.length === 0 ? (
          <StateNull />
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <TableBase
              data={todayAppointments}
              columns={[
                {
                  header: 'Patient',
                  accessor: 'patient',
                  render: (row) => (
                    <button
                      type="button"
                      className="link link-hover"
                      onClick={() => setDetailsAppointmentId(row.id)}
                    >
                      {row.patient.name}
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
                {
                  header: 'Room',
                  accessor: 'room_id',
                  render: (row) =>
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
                          <button
                            className="btn btn-neutral"
                            onClick={() => openAcceptAction(row.id)}
                          >
                            Accept
                          </button>
                          <button
                            className="btn btn-error"
                            onClick={() => openRejectAction(row.id)}
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
              ]}
            />
          </div>
        )}
      </section>

      <AppointmentDetailsDrawer
        appointmentId={detailsAppointmentId}
        onClose={() => setDetailsAppointmentId(null)}
      />

      <AppointmentActionModal
        isOpen={openReject}
        onClose={closeReject}
        onSubmit={handleRejectSubmit}
        isClinician={true}
        apiError={apiError}
      />
      <AcceptAppointmentModal
        isOpen={openAccept}
        onClose={closeAccept}
        onSubmit={handleAcceptSubmit}
        isClinician={true}
        apiError={acceptAction.apiError}
      />
      <CompleteAppointmentModal
        isOpen={openComplete}
        onClose={closeComplete}
        onSubmit={handleCompleteSubmit}
        isClinician={true}
        apiError={completeAction.apiError}
      />
    </div>
  )
}
