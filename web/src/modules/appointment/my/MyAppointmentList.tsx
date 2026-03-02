import { Link } from '@tanstack/react-router'
import type {
  PatientMyAppointmentDto,
  ServerAppointmentStatus,
  SlotAppointmentEvent,
} from '~/models/schedule'
import type { Column } from '~/components/Table/TableContent'
import TableContent from '~/components/Table/TableContent'
import { formatToLocalDate, getTime } from '~/utils/date'

const STATUS_BADGE: Record<ServerAppointmentStatus, string> = {
  PENDING: 'badge badge-outline bg-yellow-50 text-yellow-800 border-yellow-200',
  CONFIRMED: 'badge badge-outline bg-blue-50 text-blue-800 border-blue-200',
  CANCELLED: 'badge badge-outline bg-red-50 text-red-800 border-red-200',
  COMPLETED: 'badge badge-outline bg-green-50 text-green-800 border-green-200',
  NO_SHOW: 'badge badge-outline bg-gray-50 text-gray-800 border-gray-200',
}

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

type Row = {
  id: string
  status: ServerAppointmentStatus
  date: string
  time: string
  clinician: string
  specialty: string
  chief_complaint: string
  room_id: string | null
  reason: string | null
  view: string
}

interface MyAppointmentListProps {
  data: Array<PatientMyAppointmentDto>
}

export default function MyAppointmentList(props: MyAppointmentListProps) {
  const { data } = props

  const rows: Array<Row> = data.map((appt) => ({
    id: appt.id,
    status: appt.status,
    date: formatToLocalDate(appt.slot.starts_at),
    time: `${getTime(appt.slot.starts_at)} – ${getTime(appt.slot.ends_at)}`,
    clinician: appt.slot.clinician.user.name ?? '—',
    specialty: appt.slot.clinician.diagnosis?.label ?? '—',
    chief_complaint: appt.encounter?.chief_complaint ?? '—',
    room_id: appt.room_id,
    reason: getPatientVisibleReason(appt.events),
    view: appt.id,
  }))

  const columns: Array<Column<Row>> = [
    {
      header: 'Status',
      accessor: 'status',
      render: (value: ServerAppointmentStatus) => (
        <span className={STATUS_BADGE[value]}>{value}</span>
      ),
    },
    { header: 'Date', accessor: 'date' },
    { header: 'Time', accessor: 'time' },
    { header: 'Clinician', accessor: 'clinician' },
    { header: 'Specialty', accessor: 'specialty' },
    { header: 'Chief Complaint', accessor: 'chief_complaint' },
    {
      header: 'Room ID',
      accessor: 'room_id',
      render: (value: string | null) =>
        value ? (
          <code className="text-xs font-mono">{value}</code>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        ),
    },
    {
      header: 'Reason',
      accessor: 'reason',
      render: (value: string | null) =>
        value ? (
          <span className="text-sm text-gray-700">{value}</span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        ),
    },
    {
      header: '',
      accessor: 'view',
      render: (value: string) => (
        <Link
          to="/my-appointments/$appointmentId"
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
