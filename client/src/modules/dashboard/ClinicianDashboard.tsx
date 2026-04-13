import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  startOfDay,
  endOfDay,
  addDays,
  eachDayOfInterval,
  format,
} from 'date-fns'

import { fetchAppointments } from '@/api/schedule'

import StateLoading from '@/components/State/StateLoading'
import StateError from '@/components/State/StateError'

import { formatDate } from '@/utils/useDate'
import { Link } from '@tanstack/react-router'
import StateNull from '@/components/State/StateNull'
import { TableBase } from '@/components/Table/TableBase'
import AppointmentPill from '@/components/Decorator/AppointmentPill'
import AppointmentActionModal from '@/modules/appointments/AppointmentActionModal'
import useAppointmentAction from '@/modules/appointments/useAppointmentAction'
import AcceptAppointmentModal from '@/modules/appointments/AcceptAppointmentModal'
import useAcceptAppointment from '@/modules/appointments/useAcceptAppointment'
import CompleteAppointmentModal from '@/modules/appointments/CompleteAppointmentModal'
import useCompleteAppointment from '@/modules/appointments/useCompleteAppointment'

function todayRange() {
  const now = new Date()
  const start = startOfDay(now)
  const end = endOfDay(now)

  return {
    from: start.toISOString(),
    to: end.toISOString(),
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
  const start = startOfDay(new Date())
  const end = endOfDay(addDays(start, 6))

  const qWeek = useQuery(fetchAppointments({}, { from: start.toISOString() }))

  const weekAppointments = qWeek.data?.data ?? []

  // init counts
  const countsByDay: Record<string, number> = {}

  eachDayOfInterval({ start, end }).forEach((d) => {
    countsByDay[format(d, 'EEE MMM dd yyyy')] = 0
  })

  // count
  for (const appt of weekAppointments) {
    const key = format(new Date(appt.slot.startAt), 'EEE MMM dd yyyy')
    countsByDay[key] = (countsByDay[key] ?? 0) + 1
  }

  const { submit: submitReject, apiError } = useAppointmentAction(true)
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
            const d = addDays(start, i)
            const label = d.toLocaleDateString(undefined, {
              weekday: 'short',
              day: 'numeric',
            })
            const count = countsByDay[format(d, 'EEE MMM dd yyyy')] ?? 0
            const dateStr = format(d, 'yyyy-MM-dd')
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
                      <div>{formatDate(row.slot.startAt, 'p')}</div>
                      <div>to</div>
                      <div>{formatDate(row.slot.endAt, 'p')}</div>
                    </div>
                  ),
                },
                {
                  header: 'Room',
                  accessor: 'roomId',
                  render: (row) =>
                    row.status === 'ACCEPTED' && row.roomId ? (
                      <Link
                        to="/room/$roomId"
                        params={{ roomId: row.roomId }}
                        className="text-blue-600 hover:underline"
                      >
                        {row.roomId}
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
        onClose={() => setOpenReject(false)}
        onSubmit={handleRejectSubmit}
        isClinician={true}
        apiError={apiError}
      />
      <AcceptAppointmentModal
        isOpen={openAccept}
        onClose={() => setOpenAccept(false)}
        onSubmit={handleAcceptSubmit}
        isClinician={true}
      />
      <CompleteAppointmentModal
        isOpen={openComplete}
        onClose={() => setOpenComplete(false)}
        onSubmit={handleCompleteSubmit}
        isClinician={true}
      />
    </div>
  )
}
