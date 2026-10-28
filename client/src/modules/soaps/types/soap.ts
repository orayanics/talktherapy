import type { Clinician, Patient } from '#/modules/patients/types/person'
import type { Meta } from '#/types/api'

export interface Soap {
  id: string
  clinicianId: string
  patientId: string
  activity_plan?: string | null
  session_type?: string | null
  subjective_notes?: string | null
  objective_notes?: string | null
  assessment?: string | null
  recommendation?: string | null
  comments?: string | null
  createdAt: string
  updatedAt: string
  clinician: Clinician
  patient: Patient
}
export interface SoapsResponse {
  data: Soap[]
  meta: Meta
}
