// TODO: Remove inactive
import type { ACCOUNT_STATUS } from '~/models/account'

export const ACCOUNT_STATUS_BADGE_STYLES: Record<ACCOUNT_STATUS, string> = {
  active:
    'rounded-lg badge badge-outline bg-green-50 text-green-800 border-green-200',
  deactivated:
    'rounded-lg badge badge-outline bg-sky-50 text-sky-800 border-sky-200',
  pending:
    'rounded-lg badge badge-outline bg-yellow-50 text-yellow-800 border-yellow-200',
  inactive:
    'rounded-lg badge badge-outline bg-yellow-50 text-yellow-800 border-yellow-200',
  suspended:
    'rounded-lg badge badge-outline bg-red-50 text-red-800 border-red-200',
}

export const ACCOUNT_STATUS_TEXT: Record<ACCOUNT_STATUS, string> = {
  active: 'text-green-700 border-green-200',
  deactivated: 'text-sky-700 border-sky-200',
  pending: 'text-yellow-700 border-yellow-200',
  inactive: 'text-yellow-700 border-yellow-200',
  suspended: 'text-red-700 border-red-200',
}

export const ACCOUNT_STATUS_LABEL: Record<ACCOUNT_STATUS, string> = {
  suspended: 'Suspended',
  active: 'Active',
  pending: 'Pending',
  deactivated: 'Deactivated',
  inactive: 'Inactive',
}
