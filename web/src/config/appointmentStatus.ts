import type { APPOINTMENT_STATUS } from '~/models/booking'

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
