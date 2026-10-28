import type { Clinician, Patient } from './person'
import type { Meta } from '#/types/api'

export interface ClinicianPatient {
  clinicianId: string
  patientId: string
  firstCompletedAt?: string
  clinician: Clinician
  patient: Patient
}
export interface ClinicianPatientsResponse {
  data: ClinicianPatient[]
  meta: Meta
}
