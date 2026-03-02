import type React from 'react'
import type { ParsedError } from '~/models/system'
import type {
  AppointmentStatus,
  ContentFormState,
  ContentItem,
} from '~/models/content'
import type {
  AvailabilityRuleWithSlots,
  AvailableSlot,
  BookAppointmentPayload,
  PatientMyAppointmentDetailDto,
  PatientMyAppointmentDto,
  ServerAppointmentStatus,
  SlotAppointmentDto,
  SlotAppointmentEvent,
  SlotDto,
} from '~/models/schedule'
import type { UserType } from '~/models/user/user'

// ─── Alert ──────────────────────────────────────────────────────────────────

// ─── Badge ──────────────────────────────────────────────────────────────────

export interface AccountStatusBadgeProps {
  status: string
}

export interface AppointmentStatusBadgeProps {
  status: AppointmentStatus
}

export interface RoleBadgeProps {
  role: string
}

// ─── Calendar ───────────────────────────────────────────────────────────────

export interface CalenderSingleProps {
  date: Date | undefined
  onSelect: (date: Date | undefined) => void
}

// ─── Consents ───────────────────────────────────────────────────────────────

export interface ConsentsPatientProps {
  isOpen: boolean
  onClose: () => void
  onAgree: (agreed: boolean) => void
}

// ─── Filters ────────────────────────────────────────────────────────────────

export type FilterDrawerProps = {
  children: React.ReactNode
}

// ─── Input ──────────────────────────────────────────────────────────────────

export interface Option {
  value: unknown
  label: string
}

export interface InputDropdownProps {
  label?: string
  onClick?: () => void
  children?: React.ReactNode
  className?: string
  btnClassName?: string
  position?: string
}

export interface InputMultiSelectProps {
  placeholder?: string
  options: Array<Option>
  value?: Array<string>
  onChange?: (value: Array<string>) => void
  className?: string
}

export interface FilterDropdownProps<T> {
  placeholder?: string
  options: Array<Option>
  value: T
  onChange: (value: T) => void
  className?: string
}

// ─── Loader ─────────────────────────────────────────────────────────────────

export interface LoaderTableProps {
  className?: string
  children?: React.ReactNode
}

// ─── Modal ──────────────────────────────────────────────────────────────────

export interface ModalBodyProps {
  children: React.ReactNode
  className?: string
  isOpen: boolean
  onClose: () => void
}

export interface ModalHeaderProps {
  children: React.ReactNode
}

export interface ModalFooterProps {
  children: React.ReactNode
}

export interface ModalBlockNavigationProps {
  isOpen: boolean
  onReset: () => void
  onProceed: () => void
  children?: React.ReactNode
}

export interface ModalConfirmProps {
  title: string
  description: string
  confirmText: string
  cancelText: string
  onConfirm: () => void
  onCancel: () => void
  states: {
    isLoading: boolean
    errors: ParsedError | null
  }
}

// ─── Page ───────────────────────────────────────────────────────────────────

export interface GridItemProps {
  children: React.ReactNode
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  rowSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  colStart?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  rowStart?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  className?: string
}

export interface GridProps {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  rows?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  gap?: 0 | 1 | 2 | 4 | 6 | 8
  autoFit?: boolean
  className?: string
}

export interface PageTitleProps {
  heading: string
  subheading?: string
  brow?: string | null
}

// ─── Sidebar ────────────────────────────────────────────────────────────────

export interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
}

export interface SidebarNavItemsProps {
  items: Array<NavItem>
}

export interface SidebarProps {
  children: React.ReactNode
  role: UserType
}

// ─── Table ──────────────────────────────────────────────────────────────────

export type ColumnForKey<T, TKey extends keyof T> = {
  header: string
  accessor: TKey
  render?: (value: T[TKey], row: T) => React.ReactNode
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

// ─── Appointment Components ─────────────────────────────────────────────────

export interface AppointmentDetailProps {
  appointment: SlotAppointmentDto
}

export interface AppointmentEventHistoryProps {
  events: Array<SlotAppointmentEvent>
  /**
   * 'clinician' – all reasons shown for every event
   * 'patient'   – reason shown only for CANCELLED and RESCHEDULED events
   */
  variant: 'clinician' | 'patient'
}

export interface ModalCancelAppointmentProps {
  title?: string
  description?: string
  confirmText?: string
  reason: string
  onReasonChange: (value: string) => void
  showKeepBlocked?: boolean
  keepBlocked?: boolean
  onKeepBlockedChange?: (value: boolean) => void
  onConfirm: () => void
  onCancel: () => void
  states: {
    isLoading: boolean
    errors: ParsedError | null
  }
}

export interface AppointmentCardProps {
  data: Array<AvailableSlot>
}

export interface ModalBookAppointmentProps {
  slot: AvailableSlot
  form: BookAppointmentPayload
  onFormChange: (field: keyof BookAppointmentPayload, value: string) => void
  onConfirm: () => void
  onCancel: () => void
  states: {
    isLoading: boolean
    errors: ParsedError | null
  }
}

export interface ModalRescheduleAppointmentProps {
  clinicianId: string
  /** Slot that is currently booked — excluded from the options list */
  currentSlotId: string
  onConfirm: (newSlotId: string) => void
  onCancel: () => void
  states: {
    isLoading: boolean
    errors: ParsedError | null
  }
}

export interface MyAppointmentDetailProps {
  appointment: PatientMyAppointmentDetailDto
}

export interface MyAppointmentListProps {
  data: Array<PatientMyAppointmentDto>
}

// ─── Schedule Components ─────────────────────────────────────────────────────

export interface ScheduleEditProps {
  data: AvailabilityRuleWithSlots
}

export interface ScheduleDetailsIdProps {
  data: AvailabilityRuleWithSlots
}

export interface ScheduleSlotProps {
  data: AvailabilityRuleWithSlots
}

export interface ScheduleSlotItemProps {
  is_active: boolean
  slot: SlotDto
  ruleId: string
}

export interface ScheduleCardProps {
  data: Array<AvailabilityRuleWithSlots>
}

export interface ScheduleEditFormProps {
  data: AvailabilityRuleWithSlots
}

// ─── User Components ────────────────────────────────────────────────────────

export interface UserAddAdminProps {
  isOpen: boolean
  onClose: () => void
}

export interface UserAddClinicianProps {
  isOpen: boolean
  onClose: () => void
}

// ─── Content Components ─────────────────────────────────────────────────────

export interface ContentMediaCreateProps {
  form: ContentFormState
  onTitleChange: (v: string) => void
  onDescriptionChange: (v: string) => void
  onBodyChange: (v: string) => void
  onDiagnosisIdChange: (v: string) => void
  onTagsChange: (v: string) => void
}

export interface ContentMediaInfoEditProps {
  data: {
    title: string
    description: string
    body: string
    diagnosis_id: string
    tags: Array<{ tag: { name: string } }>
  }
  id: string
}

export interface ContentViewProps {
  contentId: string
}

export interface AdminContentProps {
  title: string
  name: string
  description: string
  label: string
  tags: Array<{ tag: { name: string } }>
  updated_at: string
  contentId: string
}

// ─── Dashboard Components ───────────────────────────────────────────────────

export interface DashboardData {
  total: number
  patients: number
  clinicians: number
  admins: number
  appointments: number
}

export interface AppointmentStatsCardProps {
  appointments?: number
}

// ─── Schedule Overview Components ───────────────────────────────────────────

export interface ScheduleOverviewProps {
  search: Record<string, unknown>
}

export interface ContentOverviewProps {
  search: {
    page?: number
    perPage?: number
    search?: string
    diagnosis?: Array<string>
  }
  isLoading: boolean
  isError: boolean
  data:
    | {
        diagnoses: Array<{ value: string; label: string }>
        content: {
          data: Array<ContentItem>
          meta: {
            page: number
            per_page: number
            total: number
          }
        }
      }
    | undefined
}

// ─── Route-level Table Props ─────────────────────────────────────────────────

export interface LogItem {
  id: string
  timestamp: string
  userId: string
  action: string
  details: string
}

export interface LogsTableProps {
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  isLoading?: boolean
  data: Array<LogItem>
  page: number
  perPage: number
}

export interface PatientListItem {
  id: number
  email: string
  diagnosis: string
  information: {
    firstName: string
    lastName: string
    profileUrl: string
  }
}

export interface PatientsTableProps {
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  isLoading?: boolean
  data: Array<PatientListItem>
  page: number
  perPage: number
}

// ─── My Appointment List Row ─────────────────────────────────────────────────

export type MyAppointmentRow = {
  id: string
  status: ServerAppointmentStatus
  date: string
  time: string
  clinician: string
  specialty: string
  chief_complaint: string
  room_id: string | null
  reason: string | null
  view: string
}
