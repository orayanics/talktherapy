export interface LogsClient {
  id: string
  timestamp: Date
  userId: string // Reference to user table
  action: string
  details?: string
}

export interface NotificationClient {
  id: string
  showTo: {
    users?: Array<string> // Array of user IDs
  }
  title: string
  message: string
  type: 'info' | 'warning' | 'alert'
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

// Laravel API Response
export interface ResponseData {
  data: Array<string>
}

export interface ErrorResponse {
  message?: string | { code: number; response: string }
  errors?: Record<string, Array<string>>
}

export interface TableResponse<T = unknown> {
  current_page?: number
  data: Array<T>
  total?: number
  last_page?: number
  from?: number | null
  to?: number | null
  per_page?: number
}

export type UsersParams = {
  search?: string
  account_status?: Array<string>
  account_role?: Array<string>
  page?: number
  perPage?: number
}

export type UsersTableProps = {
  data: TableResponse<UserResponse> | null
  page: number
  perPage: number
  status: Array<string>
  role: Array<string>
  search: string
  isLoading: boolean
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  onStatusChange: (status: Array<string>) => void
  onRoleChange: (role: Array<string>) => void
  onSearchChange: (search: string) => void
  onClearFilters: () => void
}

export interface UserResponse {
  id: string
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
  account_status: 'active' | 'inactive' | 'pending' | 'suspended'
  account_role: 'sudo' | 'admin' | 'clinician' | 'patient'
  account_permissions: Array<string> | null
  account_icon: string | null
  created_by: string
  updated_by: string | null
  deleted_at: string | null
  last_login: string | null
}
