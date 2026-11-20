import { queryOptions } from '@tanstack/react-query'

import { api } from '#/lib/api/client'

export interface SlpAssignment {
  id: string
  patient_id: string
  clinician_id: string
  exercise_version_id: string
  status: 'active' | 'cancelled' | 'completed'
  schedule: Record<string, unknown> | null
  patient?: { id: string; name: string | null }
  version?: {
    id: string
    prompt_text: string
    task_type: string
    language: string
    status: string
    exercise?: {
      id: string
      collection: { id: string; title: string } | null
    } | null
  }
}
export interface SlpAttemptStatus {
  id: string
  status: string
  analysis_status?: string | null
  analysis?: { status: string; result?: Record<string, unknown> | null }
}
export interface SlpReviewAttempt extends SlpAttemptStatus {
  patient: { id: string; name: string | null }
  exercise: {
    id: string
    prompt_text: string
    task_type: string
    language: string
  }
  recording: {
    url: string
    mime_type: string
    bytes: number
    duration_ms: number | null
  } | null
  latest_review?: {
    id: string
    revision: number
    status: string
    annotations: Record<string, unknown>[] | null
  } | null
}
export interface SlpReport {
  id: string
  status: 'approved' | 'released'
  released_at: string | null
  patient?: { id: string; name: string | null }
  exercise: { prompt_text: string; task_type: string; language: string }
  snapshot: {
    prompt_text?: string
    language?: string
    annotations?: Record<string, unknown>[] | null
    metrics?: Record<string, unknown> | null
    approved_at?: string
  }
}
type ListResponse<T> = { data: T[]; meta: Record<string, unknown> }

export const slpWorkflowKeys = {
  all: ['slp-workflow'] as const,
  assignments: ['slp-workflow', 'assignments'] as const,
  attempt: (id: string) => ['slp-workflow', 'attempt', id] as const,
  reviewAttempts: ['slp-workflow', 'review-attempts'] as const,
}

export const fetchSlpAssignments = () =>
  queryOptions<ListResponse<SlpAssignment>>({
    queryKey: slpWorkflowKeys.assignments,
    queryFn: () =>
      api<ListResponse<SlpAssignment>>('/api/v1/slp/assignments', {
        params: { per_page: 100 },
      }),
  })

export const mutateCreateSlpAssignment = (input: {
  audience?: 'all' | 'selected'
  patient_id?: string
  patient_ids?: string[]
  exercise_version_id: string
  schedule?: Record<string, unknown>
}) =>
  api<{ data: SlpAssignment[] }>('/api/v1/slp/assignments', {
    method: 'POST',
    data: input,
  })

export const mutateUnassignSlpAssignment = (assignmentId: string) =>
  api<void>(`/api/v1/slp/assignments/${assignmentId}`, { method: 'DELETE' })

export const mutateCreateSlpConsent = (input: {
  subject_id: string
  purpose: 'slp_recording'
  policy_version: string
}) => api('/api/v1/slp/consents', { method: 'POST', data: input })

export const mutateCreateSlpAttempt = (
  assignmentId: string,
  input: { submission_key: string; consent_id: string },
) =>
  api<{ data: SlpAttemptStatus }>(
    `/api/v1/slp/assignments/${assignmentId}/attempts`,
    { method: 'POST', data: input },
  )

export const mutateUploadSlpRecording = (
  attemptId: string,
  recording: Blob,
) => {
  const data = new FormData()
  data.append('recording', recording, 'recording.webm')
  return api(`/api/v1/slp/attempts/${attemptId}/recording`, {
    method: 'POST',
    data,
  })
}

export const fetchSlpAttempt = (attemptId: string) =>
  queryOptions<{ data: SlpAttemptStatus }>({
    queryKey: slpWorkflowKeys.attempt(attemptId),
    queryFn: () => api(`/api/v1/slp/attempts/${attemptId}`),
    refetchInterval: (query) =>
      ['queued', 'running'].includes(
        query.state.data?.data.analysis_status ?? '',
      )
        ? 2000
        : false,
  })

export const fetchSlpReviewAttempts = (status?: string) =>
  queryOptions<ListResponse<SlpReviewAttempt>>({
    queryKey: [...slpWorkflowKeys.reviewAttempts, status ?? 'default'],
    queryFn: () =>
      api<ListResponse<SlpReviewAttempt>>('/api/v1/slp/review-attempts', {
        params: status ? { status } : undefined,
      }),
  })

export const fetchSlpRecording = (attemptId: string) =>
  queryOptions<Blob>({
    queryKey: ['slp-workflow', 'recording', attemptId],
    queryFn: () =>
      api<Blob>(`/api/v1/slp/attempts/${attemptId}/recording`, {
        responseType: 'blob',
      }),
  })

export const fetchSlpReports = () =>
  queryOptions<ListResponse<SlpReport>>({
    queryKey: ['slp-workflow', 'reports'],
    queryFn: () => api<ListResponse<SlpReport>>('/api/v1/slp/reports'),
  })

export const mutateReleaseSlpReport = (reportId: string) =>
  api<{ data: SlpReport }>(`/api/v1/slp/reports/${reportId}/release`, {
    method: 'POST',
  })

export const mutateSaveSlpReview = (
  attemptId: string,
  input: {
    annotations: Record<string, unknown>[]
    metrics?: Record<string, unknown>
  },
) =>
  api<{ data: { id: string } }>(`/api/v1/slp/attempts/${attemptId}/review`, {
    method: 'PUT',
    data: input,
  })

export const mutateApproveSlpReview = (reviewId: string) =>
  api(`/api/v1/slp/reviews/${reviewId}/approve`, { method: 'POST' })
