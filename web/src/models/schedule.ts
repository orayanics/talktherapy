export type Freq = 'none' | 'DAILY' | 'WEEKLY' | 'MONTHLY'
export type SlotStatus = 'AVAILABLE' | 'BOOKED' | 'BLOCKED' | 'CANCELLED'

export interface AvailabilityRulesParams {
  date?: Date
  page?: number
  perPage?: number
}

export interface PatientAppointmentsQueryParams {
  date?: Date
  diagnosis?: string
  page?: number
  perPage?: number
}

export interface SlotDto {
  id: string
  starts_at: string
  ends_at: string
  status: SlotStatus
}

export interface AvailabilityRuleWithSlots {
  id: string
  starts_at: string
  ends_at: string
  is_active: boolean
  recurrence_rule: string
  slots: Array<SlotDto>
}

export interface AvailableSlotClinician {
  user: {
    name: string
  }
  diagnosis: {
    label: string
  }
}

export interface AvailableSlot {
  id: string
  starts_at: string
  ends_at: string
  clinician: AvailableSlotClinician
}

export interface ScheduleRecurrenceProps {
  recurrenceInfo: {
    freq: Freq | null
    byday: Array<string> | null
  }
  date: string
  lastSlot: SlotDto
}

export interface CreateAvailabilityPayload {
  starts_at: string
  ends_at: string
  recurrence_rule?: string
  horizon_days?: number
}

export interface CreateSchedulePayload {
  date: string
  start_time: string
  end_time: string
  freq: Freq
  selected_days: Array<string>
  horizon_days: number
}

export interface UpdateAvailabilityPayload {
  starts_at?: string
  ends_at?: string
  recurrence_rule?: string
  is_active?: boolean
  horizon_days?: number
}
