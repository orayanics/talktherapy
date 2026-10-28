import type { DiagnosisItem } from '#/modules/diagnoses/types/diagnosis'

export interface Patient {
  id: string
  name: string
}
export interface Clinician {
  id: string
  name: string
  diagnosis: DiagnosisItem | null
}
