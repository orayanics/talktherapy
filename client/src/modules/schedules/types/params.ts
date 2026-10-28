export interface ScheduleParams {
  page?: number
  from?: string
  to?: string
  sort?: 'asc' | 'desc' | string
  diagnosis?: Array<string>
}
