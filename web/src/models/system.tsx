// Session User
export interface SESSION_USER {
  id: string
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
  account_status: 'active' | 'deactivated' | 'pending' | 'suspended'
  account_role: 'sudo' | 'admin' | 'clinician' | 'patient'
  account_permissions: string | null
  account_icon: string | null
  created_by: string
  updated_by: string | null
  deleted_at: string | null
  last_login: string | null
  diagnosis?: string
}

// API Response Types
export interface ParsedError {
  message: string
  errors?: Record<string, Array<string>>
}

// Context Types
export interface SessionContextValue extends SESSION_USER {}
