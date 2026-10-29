export interface LogParams {
  page?: number
  per_page?: number
  search?: string
  action?: string
  entity?: string
  actor_email?: string
  actor_id?: string
  actor_role?: string
  date_from?: string
  date_to?: string
  sort?: 'asc' | 'desc' | string
}
