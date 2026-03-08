import { Link } from '@tanstack/react-router'
import { parseISO } from 'date-fns'
import type {
  ServerAppointmentStatus,
  SlotAppointmentEvent,
} from '~/models/booking'
import type {
  MyAppointmentListProps,
  MyAppointmentRow,
} from '~/models/components'
import type { Column } from '~/models/table'
import TableContent from '~/components/Table/TableContent'
import {
  APPOINTMENT_STATUS_BADGE,
  APPOINTMENT_STATUS_TEXT,
} from '~/config/appointmentStatus'
import { formatToLocalDate, getTime } from '~/utils/date'

/**
 * Returns the reason from the most recent patient-visible event.
 * Patients see reasons only for CANCELLED and RESCHEDULED events.
 */
function getPatientVisibleReason(
  events: Array<SlotAppointmentEvent>,
): string | null {
  const found = events.find(
    (e) =>
      (e.type === 'CANCELLED' || e.type === 'RESCHEDULED') && e.reason != null,
  )
  return found?.reason ?? null
}

export default function MyAppointmentList(props: MyAppointmentListProps) {
  const { data } = props

  const rows: Array<MyAppointmentRow> = data.map((appt) => ({
    id: appt.id,
    status: appt.status,
    date: formatToLocalDate(appt.slot.starts_at),
    time: `${getTime(appt.slot.starts_at)} – ${getTime(appt.slot.ends_at)}`,
    starts_at: appt.slot.starts_at,
    clinician: appt.slot.clinician.user.name ?? '—',
    specialty: appt.slot.clinician.diagnosis?.label ?? '—',
    chief_complaint: appt.encounter?.chief_complaint ?? '—',
    room_id: appt.room_id,
    reason: getPatientVisibleReason(appt.events),
    view: appt.id,
  }))

  const columns: Array<Column<MyAppointmentRow>> = [
    {
      header: 'Status',
      accessor: 'status',
      render: (value: ServerAppointmentStatus) => (
        <span className={APPOINTMENT_STATUS_BADGE[value]}>
          {APPOINTMENT_STATUS_TEXT[value]}
        </span>
      ),
    },
    { header: 'Date', accessor: 'date' },
    { header: 'Time', accessor: 'time' },
    { header: 'Clinician', accessor: 'clinician' },
    { header: 'Chief Complaint', accessor: 'chief_complaint' },
    {
      header: 'Room',
      accessor: 'room_id',
      render: (_: unknown, row: MyAppointmentRow) => {
        const isPastAppointment = parseISO(row.starts_at) < new Date()

        if (row.status !== 'CONFIRMED' && isPastAppointment && row.room_id) {
          return (
            <code className="text-xs font-mono text-gray-400">
              {row.room_id.slice(0, 8)}…
            </code>
          )
        }

        if (row.status === 'CONFIRMED' && !isPastAppointment && row.room_id) {
          return (
            <Link
              to="/$roomId"
              params={{ roomId: row.room_id }}
              className="btn btn-primary btn-xs"
            >
              Join Session
            </Link>
          )
        }

        return <span className="text-gray-400 text-xs">—</span>
      },
    },
    {
      header: 'Action',
      accessor: 'view',
      render: (value: string) => (
        <Link
          to="/appointments/$appointmentId"
          params={{ appointmentId: value }}
          className="btn btn-ghost btn-xs"
        >
          View
        </Link>
      ),
    },
  ]

  return <TableContent columns={columns} data={rows} />
}
