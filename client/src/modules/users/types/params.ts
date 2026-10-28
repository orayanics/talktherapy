export interface UsersParams {
  search?: string
  sort_by?: 'created_at'
  sort?: 'asc' | 'desc' | string
  role?: Array<string>
  account_status?: Array<string>
}
