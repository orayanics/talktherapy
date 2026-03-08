import type { Freq } from './booking'

// Credential Payloads
export interface LoginPayload {
  email: string
  password: string
}

export interface PatientRegisterPayload {
  name: string
  diagnosis_id: string
  email: string
  password: string
  password_confirmation: string
  consent: boolean
}

export interface ClinicianRegisterPayload {
  email: string
}

export interface AdminRegisterPayload {
  email: string
  abilities: Array<string>
}

export interface UpdateUserPayload {
  name?: string
}

export interface UpdatePasswordPayload {
  current_password: string
  new_password: string
  new_password_confirmation: string
}

export interface ActivateAccountPayload {
  name: string
  email: string
  otp_code: string
  password: string
  password_confirmation: string
  diagnosis_id?: string
}

export interface VerifyOtpPayload {
  email: string
  otp_code: string
}

// Content Payloads
export interface CreateContentPayload {
  title: string
  description: string
  body: string
  diagnosis_id: string
  tag_names?: Array<string>
}

export interface UpdateContentPayload {
  title?: string
  description?: string
  body?: string
  diagnosis_id?: string
  tag_names?: Array<string>
}

// Scheduling Payloads
// Availability Rule
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

// Appointment
export interface BookAppointmentPayload {
  medical_diagnosis?: string
  source_referral?: string
  chief_complaint?: string
  referral_url?: string
}

// Soap
export interface CreateSoapPayload {
  activity_plan: string
  session_type: string
  subjective_notes: string
  objective_notes: string
  assessment: string
  recommendation: string
  comments?: string
}
