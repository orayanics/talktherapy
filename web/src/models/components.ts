import type React from 'react'
import type { ParsedError } from '~/models/system'
import type { ContentFormState } from '~/models/content'
import type {
  AvailabilityRuleWithSlots,
  AvailableSlot,
  PatientMyAppointmentDetailDto,
  PatientMyAppointmentDto,
  ServerAppointmentStatus,
  SlotAppointmentDto,
  SlotAppointmentEvent,
  SlotDto,
} from '~/models/booking'
import type { APPOINTMENT_STATUS } from './booking'
import type { ACCOUNT_ROLE, ACCOUNT_STATUS } from './account'
import type { BookAppointmentPayload } from './payloads'

export interface StatusProps<
  T extends APPOINTMENT_STATUS | ACCOUNT_STATUS =
    | APPOINTMENT_STATUS
    | ACCOUNT_STATUS,
> {
  status: T
}

export interface RoleBadgeProps {
  role: string
}

// ─── Calendar ───────────────────────────────────────────────────────────────

export interface CalenderSingleProps {
  date: Date | undefined
  onSelect: (date: Date | undefined) => void
  disablePast?: boolean
}

export interface CalenderSingleDropdownProps {
  date: Date | undefined
  onSelect: (date: Date | undefined) => void
  disablePast?: boolean
  placeholder?: string
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
  value: string | number
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
  role: ACCOUNT_ROLE
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
  errors: ParsedError | null
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void
  handleBodyChange: (value: string | undefined) => void
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

// ─── Route-level Table Props ─────────────────────────────────────────────────

export interface LogItem {
  id: string
  actor_id: string | null
  actor_email: string | null
  actor_role: string | null
  action: string
  entity: string | null
  entity_id: string | null
  details: string | null
  created_at: string
}

export interface LogsTableProps {
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  isLoading?: boolean
  data: Array<LogItem>
  page: number
  perPage: number
  total: number
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
