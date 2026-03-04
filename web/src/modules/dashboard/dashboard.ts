import type {
  DashboardCountItem,
  DashboardStatusCount,
} from '~/models/dashboard'

export function resolveStatus(
  items: Array<DashboardCountItem> | undefined,
): DashboardStatusCount {
  const get = (status: string) =>
    (items ?? []).find((i) => i.account_status === status)?.count ?? 0
  return {
    active: get('active'),
    inactive: get('inactive'),
    pending: get('pending'),
    deactivated: get('deactivated'),
    suspended: get('suspended'),
  }
}
