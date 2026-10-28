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
