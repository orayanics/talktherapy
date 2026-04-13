export interface QueryParams {
  page?: number
}

export interface Meta {
  current_page: number
  from: number | null
  last_page: number
  per_page: number
  to: number | null
  total: number
}

export interface Diagnosis {
  id: string
  value: string
  label: string
}

export interface UsersParams {
  search?: string // search term for name or email
  sort_by?: 'created_at'
  sort?: 'asc' | 'desc' | string
  role?: Array<string>
  account_status?: Array<string>
}

export interface ContentParams {
  search?: string
  diagnosis?: Array<string>
  sort?: 'asc' | 'desc' | string
  is_bookmarked?: boolean
}

export interface LogParams {
  page?: number
  per_page?: number
  search?: string
  action?: string
  entity?: string
  actor_email?: string
  actor_id?: string
  date_from?: string // ISO date string
  date_to?: string // ISO date string
  sort?: 'asc' | 'desc' | string
}

export interface ScheduleParams {
  page?: number
  from?: string // ISO date string
  to?: string // ISO date string
  sort?: 'asc' | 'desc' | string
  diagnosis?: Array<string>
}

export interface ClinicianPatientsParams {
  page?: number
  search?: string
  sort?: 'asc' | 'desc' | string
}
