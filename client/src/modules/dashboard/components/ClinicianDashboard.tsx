import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { fetchAppointments } from '#/modules/appointments/api/appointments'

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

function todayRange() {
  const today = formatDate(new Date(), 'yyyy-MM-dd')

  return {
    from: today,
    to: today,
  }
}

export default function ClinicianDashboard() {
  const [selected, setSelected] = useState<string | null>(null)
  const [openReject, setOpenReject] = useState(false)
  const [openAccept, setOpenAccept] = useState(false)
  const [openComplete, setOpenComplete] = useState(false)

  const { from, to } = todayRange()

  const q = useQuery(fetchAppointments({}, { from, to }))
  const appointments = q.data?.data ?? []

  // next 7 days
  const weekFrom = formatDate(new Date(), 'yyyy-MM-dd')
  const start = new Date(`${weekFrom}T00:00:00.000Z`)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 6)

  const qWeek = useQuery(
    fetchAppointments({}, { from: weekFrom, to: formatDate(end, 'yyyy-MM-dd') }),
  )

  const weekAppointments = qWeek.data?.data ?? []

  // init counts
  const countsByDay: Record<string, number> = {}

  for (let day = 0; day < 7; day += 1) {
    const date = new Date(start)
    date.setUTCDate(start.getUTCDate() + day)
    countsByDay[formatDate(date, 'EEE MMM dd yyyy')] = 0
  }

  // count
  for (const appt of weekAppointments) {
    const key = formatDate(appt.slot.start_at, 'EEE MMM dd yyyy')
    countsByDay[key] = (countsByDay[key] ?? 0) + 1
  }

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

  const handleRejectSubmit = async (payload: any) => {
    if (!selected) return
    await submitReject(selected, payload)
  }

  const handleAcceptSubmit = async (payload?: any) => {
    if (!selected) return
    await acceptAction.submit(selected, payload)
  }

  const handleCompleteSubmit = async (payload?: any) => {
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
      <section className="space-y-4">
        <div>
          <p className="text-lg font-bold text-slate-900 uppercase tracking-tight">
            Schedule
          </p>
          <p className="text-xs text-slate-400 font-medium">
            Quick view of your appointments for the week.
          </p>
        </div>

        <div className="grid grid-cols-3 lg:grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(start)
            d.setUTCDate(start.getUTCDate() + i)
            const label = d.toLocaleDateString(undefined, {
              weekday: 'short',
              day: 'numeric',
            })
            const count = countsByDay[formatDate(d, 'EEE MMM dd yyyy')] ?? 0
            const dateStr = formatDate(d, 'yyyy-MM-dd')
            return (
              <Link
                key={d.toDateString()}
                to="/schedules"
                search={{
                  from: dateStr,
                }}
                className="p-4 bg-white border border-slate-200 shadow-xs rounded-lg flex flex-col items-center gap-2"
              >
                <div className="text-sm text-slate-900">{label}</div>
                <div className="text-center">
                  <p className="text-sm font-bold">{count}</p>
                  <p className="text-xs text-slate-500">Appointments</p>
                </div>
              </Link>
            )
          })}
        </div>
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

        {appointments.length === 0 ? (
          <StateNull />
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <TableBase
              data={appointments}
              columns={[
                {
                  header: 'Patient',
                  accessor: 'patient',
                  render: (row) => (
                    <Link
                      to="/appointments/$appointmentId"
                      params={{ appointmentId: row.id }}
                      className="link link-hover"
                    >
                      {row.patient.name}
                    </Link>
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
                        params={{ roomId: row.room_id }}
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
