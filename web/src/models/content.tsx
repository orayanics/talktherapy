export interface MediaContentClient {
  id: string
  title: string
  description: string
  body: string // Markdown content
  authorId: string
  createdAt: string
  updatedAt: string
  category: string
  tags?: string[]
}

export interface SoapContentClient {
  id: string
  patientId: string
  clinicianId: string // Reference to clinician table
  information: {
    activityPlan: string // Markdown content
    sessionType: string
    subjectiveNotes: string // Markdown content
    objectiveNotes: string // Markdown content
    assessment: string // Markdown content
    recommendation: string // Markdown content
    comments?: string // Markdown content
  }
  createdAt: Date
  updatedAt: Date
}

export interface ScheduleContentClient {
  id: string
  clinicianId: string // Reference to clinician table
  day: string // e.g., "Monday"
  startTime: string // e.g., "09:00"
  endTime: string // e.g., "17:00"
  scheduleStatus: 'available' | 'unavailable' | 'booked'
  type: {
    recurrence: 'none' | 'daily' | 'weekly' | 'monthly'
    endDate?: Date
  }
  createdAt: Date
  updatedAt: Date
}

export type AppointmentStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'completed'
  | 'requested'
  | 'rescheduled'
  | 'fallback'

export type AppointmentStatusValues = {
  [key in AppointmentStatus]: string
}

// Mapping of appointment status keys to their display values
export const AppointmentStatusValues: AppointmentStatusValues = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  completed: 'Completed',
  requested: 'For Reschedule',
  rescheduled: 'Rescheduled',
  fallback: 'N/A',
}

export interface AppointmentContentClient {
  id: string
  patientId: string // Reference to patient table
  clinicianId: string // Reference to clinician table
  scheduledId: string // Reference to schedule table

  medicalDiagnosis: string
  sourceOfReferral: string
  chiefComplaint: string
  referralUploadUrl: string

  schedule: {
    isReschedule?: boolean
    newScheduleDate: Date
    temporaryRescheduleDate?: Date
    rescheduleReason?: string
  }

  appointmentStatus: AppointmentStatus
  appointmentRoomId: string

  createdAt: Date
  updatedAt: Date
}
