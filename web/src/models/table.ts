import type {
  ACCOUNT_PERMISSIONS,
  ACCOUNT_PERMISSIONS_ARRAY,
  ACCOUNT_ROLE,
  ACCOUNT_STATUS,
} from './account'
import type { TagItem } from './content'
import type { DiagnosisItem } from './public'

export interface UserListTableFilters {
  search?: string
  role?: Array<ACCOUNT_ROLE>
  status?: Array<ACCOUNT_STATUS>
  onSearchChange: (search: string) => void
  onRoleChange: (roles: Array<ACCOUNT_ROLE>) => void
  onStatusChange: (statuses: Array<ACCOUNT_STATUS>) => void
  onClearFilters: () => void
}

export interface UserListItem {
  id: string
  name: string
  email: string
  account_status: ACCOUNT_STATUS
  account_role: ACCOUNT_ROLE
  account_permissions: ACCOUNT_PERMISSIONS | ACCOUNT_PERMISSIONS_ARRAY
  created_at: string
  updated_at: string
  created_by: string
  updated_by: string | null
  deleted_at: string | null
  last_login: string | null
}

export interface UserListTableProps {
  search: {
    page?: number
    perPage?: number
    search?: string
    role?: Array<ACCOUNT_ROLE>
    status?: Array<ACCOUNT_STATUS>
  }
  isLoading: boolean
  isError: boolean
  data?: {
    data: Array<UserListItem>
    meta: {
      page: number
      per_page: number
      total: number
    }
  }
}

export interface ContentListTableFilters {
  search?: string
  diagnosis?: Array<string>
  diagnosisOptions: Array<DiagnosisItem>
  onSearchChange: (search: string) => void
  onDiagnosisChange: (diagnosis: Array<string>) => void
  onClearFilters: () => void
}

export interface ContentListItem {
  id: string
  author_id: string
  diagnosis_id: string
  title: string
  description: string
  body: string
  created_at: string
  updated_at: string
  author: {
    id: string
    name: string
    email: string
  }
  diagnosis: {
    id: string
    value: string
    label: string
  }
  tags: Array<{ tag: TagItem }>
}

export interface ContentListTableProps {
  search: {
    page?: number
    perPage?: number
    search?: string
    diagnosis?: Array<string>
  }
  isLoading: boolean
  isError: boolean
  data?: {
    content: {
      data: Array<ContentListItem>
      meta: {
        page: number
        per_page: number
        total: number
        last_page: number
        from: number | null
        to: number | null
      }
    }
    diagnoses: Array<DiagnosisItem>
  }
}

export interface MyPatientsListTableFilters {
  search?: string
  onSearchChange: (search: string) => void
  onClearFilters: () => void
}

export type MyPatientItem = {
  id: string
  user_id: string
  name: string
  email: string
  diagnosis: string
  first_completed_at: string
}

export interface MyPatientsTableProps {
  search: {
    page?: number
    perPage?: number
    search?: string
  }
  isLoading: boolean
  isError: boolean
  data?: {
    data: Array<MyPatientItem>
    meta: {
      page: number
      per_page: number
      total: number
    }
  }
}

export interface ScheduleListProps {
  search: {
    page?: number
    perPage?: number
    date?: Date
  }
}

export interface RecordListItem {
  id: string
  clinician_id: string
  patient_id: string
  activity_plan: string
  session_type: string
  subjective_notes: string
  objective_notes: string
  assessment: string
  recommendation: string
  comments: string | null
  created_at: string
  updated_at: string
  clinician_name: string
}

export interface RecordsListProps {
  search: {
    page?: number
    perPage?: number
    date?: string
    search?: string
  }
  isLoading: boolean
  isError: boolean
  selectedId?: string
  onSelect: (record: RecordListItem) => void
  data?: {
    data: Array<RecordListItem>
    meta: {
      page: number
      per_page: number
      total: number
      last_page?: number
      from?: number
      to?: number
    }
  }
}

// General Table Typing: Component
// This is used for TableComponent
export type ColumnForKey<T, TKey extends keyof T> = {
  header: string
  accessor: TKey
  render?: (value: T[TKey], row: T) => React.ReactNode
  className?: string
}
export type Column<T> = { [K in keyof T]: ColumnForKey<T, K> }[keyof T]
export type TableContentProps<T> = {
  columns: Array<Column<T>>
  data: Array<T>
  renderers?: Partial<Record<keyof T, (value: any, row: T) => React.ReactNode>>
}
export interface TableHeaderProps {
  heading?: string
  children?: React.ReactNode
  className?: string
}
export type TablePaginationProps = {
  page: number
  perPage: number
  total: number
  lastPage?: number
  from?: number | null
  to?: number | null
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  perPageOptions?: Array<{
    value: number
    label: string
  }>
  className?: string
}
