import type { ACCOUNT_ROLE, ACCOUNT_STATUS } from './account'
import type { ServerAppointmentStatus } from './booking'

export interface UsersParams {
  search?: string
  account_status?: Array<ACCOUNT_STATUS>
  account_role?: Array<ACCOUNT_ROLE>
  page?: number
  perPage?: number
}

export interface ContentListParams {
  page?: number
  perPage?: number
  search?: string
  diagnosis?: Array<string>
}

export interface BookmarkListParams {
  page?: number
  perPage?: number
  search?: string
  diagnosis?: Array<string>
}

// Schedule / Appointment Params

export interface AvailabilityRulesParams {
  date?: Date
  page?: number
  perPage?: number
}

export interface PatientAppointmentsQueryParams {
  date?: Date
  diagnosis?: string
  page?: number
  perPage?: number
}

export interface MyAppointmentsParams {
  status?: ServerAppointmentStatus
  page?: number
  perPage?: number
}

export interface ClinicianMyPatientParams {
  search?: string
  page?: number
  perPage?: number
}

export interface ClinicianPatientDetailParams {
  from?: string
  to?: string
  page?: number
  perPage?: number
}

export interface PatientRecordsParams {
  from?: string
  to?: string
  clinician_name?: string
  page?: number
  perPage?: number
}
