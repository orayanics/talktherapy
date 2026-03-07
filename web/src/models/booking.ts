export type APPOINTMENT_STATUS =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show'

export type Freq = 'none' | 'DAILY' | 'WEEKLY' | 'MONTHLY'
export type SlotStatus = 'AVAILABLE' | 'BOOKED' | 'BLOCKED' | 'CANCELLED'
export type ReferralMode = 'link' | 'file'

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

export interface PatientMyAppointmentDto {
  id: string
  status: ServerAppointmentStatus
  room_id: string | null
  booked_at: string
  confirmed_at: string | null
  cancelled_at: string | null
  slot: {
    id: string
    starts_at: string
    ends_at: string
    status: string
    clinician: {
      id: string
      user: { name: string | null }
      diagnosis: { label: string } | null
    }
  }
  encounter: {
    id: string
    chief_complaint: string | null
    diagnosis: string | null
    referral_source: string | null
  } | null
  events: Array<SlotAppointmentEvent>
}

export interface SlotAppointmentEncounter {
  id: string
  appointment_id: string
  diagnosis: string | null
  chief_complaint: string | null
  referral_source: string | null
  referral_url: string | null
  notes: string | null
}

export interface SlotAppointmentEvent {
  id: string
  type: string
  actor_type: string
  actor_id: string
  reason: string | null
  created_at: string
}

export type ServerAppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW'

export interface SlotAppointmentDto {
  id: string
  slot_id: string
  patient_id: string
  status: ServerAppointmentStatus
  room_id: string | null
  booked_at: string
  confirmed_at: string | null
  cancelled_at: string | null
  completed_at: string | null
  rescheduled_at: string | null
  slot: {
    id: string
    starts_at: string
    ends_at: string
    status: string
  }
  encounter: SlotAppointmentEncounter | null
  events: Array<SlotAppointmentEvent>
}

export interface PatientMyAppointmentDetailDto {
  id: string
  slot_id: string
  patient_id: string
  status: ServerAppointmentStatus
  room_id: string | null
  booked_at: string
  confirmed_at: string | null
  cancelled_at: string | null
  completed_at: string | null
  rescheduled_at: string | null
  slot: {
    id: string
    starts_at: string
    ends_at: string
    status: string
    clinician: {
      id: string
      user: { name: string | null }
      diagnosis: { label: string; value: string } | null
    }
  }
  encounter: SlotAppointmentEncounter | null
  events: Array<SlotAppointmentEvent>
}

export interface ClinicianMyPatient {
  id: string
  user_id: string
  name: string | null
  email: string
  last_login: string | null
  diagnosis: string | null
  first_completed_at: string
}

export interface PaginationMeta {
  total: number
  page: number
  per_page: number
  page_count: number
  from: number
  to: number
}

// ─── Patient Detail ─────────────────────────────────────────────────────────

export interface ClinicianPatientDetailAppointmentDto {
  id: string
  patient_id: string
  status: ServerAppointmentStatus
  completed_at: string | null
  booked_at: string
  slot: {
    id: string
    starts_at: string
    ends_at: string
    status: string
  }
  encounter: SlotAppointmentEncounter | null
}

export interface ClinicianPatientDetailDto {
  patient: ClinicianMyPatient
  appointments: {
    data: Array<ClinicianPatientDetailAppointmentDto>
    meta: PaginationMeta
  }
}

// ─── SOAP ────────────────────────────────────────────────────────────────────

export interface SoapMeta {
  total: number
  page: number
  per_page: number
  last_page: number
  from: number
  to: number
}

export interface SoapPaginatedDto {
  data: Array<SoapDto>
  meta: SoapMeta
}

export interface SoapDto {
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
}
