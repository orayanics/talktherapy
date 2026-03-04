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

// ─── API Payload Types ────────────────────────────────────────────────────────

export interface ContentListParams {
  page?: number
  perPage?: number
  search?: string
  diagnosis?: Array<string>
}

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

// ─── Module Types ─────────────────────────────────────────────────────────────

export interface ContentFormState {
  title: string
  description: string
  bodyValue: string
  diagnosisId: string
  tags: string
}

export interface ContentItem {
  id: string
  title: string
  description: string
  author: { name: string | null; email: string }
  diagnosis: { label: string }
  tags: Array<{ tag: { name: string } }>
}

export interface RawContent {
  title: string
  description: string
  body: string
  diagnosis_id: string
  tags: Array<{ tag: { name: string } }>
}

export interface TagItem {
  id: string
  name: string
  slug: string
}
