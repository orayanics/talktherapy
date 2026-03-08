import type {
  APPOINTMENT_STATUS,
  ServerAppointmentStatus,
} from '~/models/booking'

/**
 * Badge class map keyed by server-side status (uppercase).
 * Used in appointment detail and list components.
 */
export const APPOINTMENT_STATUS_BADGE: Record<ServerAppointmentStatus, string> =
  {
    PENDING:
      'badge badge-outline bg-yellow-50 text-yellow-800 border-yellow-200',
    CONFIRMED: 'badge badge-outline bg-blue-50 text-blue-800 border-blue-200',
    CANCELLED: 'badge badge-outline bg-red-50 text-red-800 border-red-200',
    COMPLETED:
      'badge badge-outline bg-green-50 text-green-800 border-green-200',
    NO_SHOW: 'badge badge-outline bg-gray-50 text-gray-800 border-gray-200',
  }

/**
 * Human-readable label map keyed by server-side status (uppercase).
 * Used in appointment detail and list components.
 */
export const APPOINTMENT_STATUS_TEXT: Record<ServerAppointmentStatus, string> =
  {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    CANCELLED: 'Cancelled',
    COMPLETED: 'Completed',
    NO_SHOW: 'No Show',
  }

/**
 * Badge class map keyed by client-side status (lowercase).
 * Used in AppointmentStatusBadge component.
 */
export const APPOINTMENT_STATUS_STYLES: Record<APPOINTMENT_STATUS, string> = {
  pending:
    'rounded-lg badge badge-outline bg-yellow-50 text-yellow-800 border-yellow-200',
  confirmed:
    'rounded-lg badge badge-outline bg-green-50 text-green-800 border-green-200',
  cancelled:
    'rounded-lg badge badge-outline bg-sky-50 text-sky-800 border-sky-200',
  completed:
    'rounded-lg badge badge-outline bg-red-50 text-red-800 border-red-200',
  no_show:
    'rounded-lg badge badge-outline bg-gray-50 text-gray-800 border-gray-200',
}

export const APPOINTMENT_STATUS_LABEL: Record<APPOINTMENT_STATUS, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
  no_show: 'No Show',
}

export const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'NO_SHOW', label: 'No Show' },
]
