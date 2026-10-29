import type { Meta } from '#/types/api'

export type APPOINTMENT_STATUS =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECT'
  | 'CANCELLED'
  | 'COMPLETED'

export interface AppointmentParticipant {
  id: string
  name: string
  email: string
  diagnosis?: { id: string; label: string; value: string } | null
}

export interface AppointmentSlot {
  id: string
  start_at: string
  end_at: string
  status: APPOINTMENT_STATUS
}

export interface Encounter {
  id: string
  appointment_id: string
  diagnosis: string
  chief_complaint: string
  referral_source: string
  referral_url: string | null
  created_at: string
  updated_at: string
}
export interface Event {
  id: string
  actor_type: string
  actor_id: string
  from_status: APPOINTMENT_STATUS | null
  to_status: APPOINTMENT_STATUS
  reason: string | null
  created_at: string
}
export interface Appointment {
  id: string
  slot: AppointmentSlot
  patient: AppointmentParticipant
  clinician: AppointmentParticipant
  status: APPOINTMENT_STATUS
  booked_at: string
  confirmed_at: string | null
  cancelled_at: string | null
  completed_at: string | null
  events?: Event[]
  encounter?: Encounter | null
  room_id: string | null
}
export interface AppointmentsResponse {
  data: Appointment[]
  meta: Meta
}
