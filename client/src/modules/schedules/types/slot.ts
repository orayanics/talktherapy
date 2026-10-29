import type { Meta } from '#/types/api'
import type { DiagnosisItem } from '#/modules/diagnoses/types/diagnosis'

export type SLOT_STATUS =
  'FREE' | 'PENDING' | 'ACCEPTED' | 'REJECT' | 'CANCELLED' | 'COMPLETED'

export interface Slot {
  id: string
  schedule_id: string
  clinician_id: string
  start_at: string
  end_at: string
  status: SLOT_STATUS
  is_hidden?: boolean
  clinician: {
    id: string
    name: string
    diagnosis: DiagnosisItem | null
  }
}

export interface SlotsResponse {
  data: Slot[]
  meta: Meta
}
