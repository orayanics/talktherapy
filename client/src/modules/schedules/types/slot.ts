import type { Meta } from '#/types/api'
import type { DiagnosisItem } from '#/modules/diagnoses/types/diagnosis'
import type { TSchedule } from '../types/schema'

export type SLOT_STATUS =
  'FREE' | 'PENDING' | 'ACCEPTED' | 'REJECT' | 'CANCELLED' | 'COMPLETED'
export interface Slot {
  id: string
  scheduleId: string
  clinicianId: string
  startAt: string
  endAt: string
  status: SLOT_STATUS
  isHidden: boolean
  user: { diagnosis: DiagnosisItem }
}
export interface SlotsResponse {
  data: Slot[]
  meta: Meta
}
export interface ScheduleResponse {
  data: TSchedule
}
export interface SchedulesResponse {
  data: TSchedule[]
  meta: Meta
}
