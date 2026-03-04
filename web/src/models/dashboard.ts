import type { ACCOUNT_STATUS } from '~/models/account'

export interface DashboardCountItem {
  account_status: ACCOUNT_STATUS
  count: number
}

export interface DashboardCount {
  data: {
    total: number
    patients: number
    clinicians: number
    admins: number
    patientStatusCount: Array<DashboardCountItem>
    clinicianStatusCount: Array<DashboardCountItem>
    adminStatusCount: Array<DashboardCountItem>
  }
}

export type DashboardStatusCount = {
  active: number
  inactive: number
  pending: number
  deactivated: number
  suspended: number
}
