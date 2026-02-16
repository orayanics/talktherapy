export interface Appointment {
  id: string;
  clinician_id: string;
  patient_id: string;
  schedule_instance_id?: string;
  appointment_room_id?: string;
  status: string;
  starts_at: string;
  ends_at: string;
  created_at: string;
  updated_at: string;
  medical_diagnosis?: string;
  source_referral?: string;
  chief_complaint?: string;
  referral_url?: string;
  booked_at?: string;
  confirmed_at?: string;
  cancelled_at?: string;
  completed_at?: string;
  rescheduled_at?: string;
  cancelled_by?: string;
  patient_cancel_reason?: string;
  clinician_cancel_reason?: string;
  patient_reschedule_reason?: string;
  clinician_reschedule_reason?: string;
}
export interface RescheduleRequest {
  id: string;
  appointment_id: string;
  clinician_id: string;
  patient_id: string;
  original_schedule_instance_id?: string;
  requested_schedule_instance_id?: string;
  patient_reason?: string;
  clinician_reason?: string;
  status: string;
  created_at: string;
  updated_at: string;
}
