import type { Meta } from '#/types/api'
import type { Patient, Clinician } from '#/modules/patients/types/person'
import type { Slot } from '#/modules/schedules/types/slot'

export type APPOINTMENT_STATUS =
  'FREE' | 'PENDING' | 'ACCEPTED' | 'REJECT' | 'CANCELLED' | 'COMPLETED'
export interface Encounter {
  id: string
  appointmentId: string
  diagnosis: string
  chiefComplaint: string
  referralSource: string
  referralUrl: string
  createdAt: string
  updatedAt: string
}
export interface Event {
  id: string
  type: string
  actorType: string
  actorId: string
  reason: string | null
  createdAt: string
}
export interface Appointment {
  id: string
  slot: Slot
  patient: Patient
  clinician: Clinician
  status: APPOINTMENT_STATUS
  bookedAt: string
  confirmedAt: string | null
  cancelledAt: string | null
  completedAt: string | null
  events: Event[]
  encounter: Encounter[]
  roomId?: string | null
}
export interface AppointmentsResponse {
  data: Appointment[]
  meta: Meta
}
