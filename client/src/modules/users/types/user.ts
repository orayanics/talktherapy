import type { USER_ROLE, ACCOUNT_STATUS } from '#/types/account'
import type { Meta } from '#/types/api'

export interface AdminUser {
  id: string
  name: string
  email: string
  email_verified_at: string | null
  role: USER_ROLE
  status: ACCOUNT_STATUS
  diagnosis_id: string | null
  image: string | null
  created_at: string
  updated_at: string
}
export interface UsersCount {
  total: number
  active: number
  suspended: number
  pending: number
}
export interface UsersResponse {
  data: AdminUser[]
  meta: Meta
}
export interface CountResponse {
  data: { counts: UsersCount }
}
