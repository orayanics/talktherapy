import {
  useMutation,
  useQueryClient,
  queryOptions,
} from '@tanstack/react-query'
import { api } from '#/lib/api/client'

export interface SlpAssignment {
  id: string
  patient_id: string
  clinician_id: string
  exercise_version_id: string
  status: 'active' | 'cancelled' | 'completed'
  schedule: Record<string, unknown> | null
  version?: {
    prompt_text: string
    task_type: string
    language: string
    status: string
  }
}
export interface SlpAttemptStatus {
  id: string
  status: string
  analysis?: { status: string; result?: Record<string, unknown> | null }
}
type ListResponse<T> = { data: T[]; meta: Record<string, unknown> }

export const slpWorkflowKeys = {
  all: ['slp-workflow'] as const,
  assignments: ['slp-workflow', 'assignments'] as const,
  attempt: (id: string) => ['slp-workflow', 'attempt', id] as const,
}

export const fetchSlpAssignments = () =>
  queryOptions<ListResponse<SlpAssignment>>({
    queryKey: slpWorkflowKeys.assignments,
    queryFn: () => api<ListResponse<SlpAssignment>>('/api/v1/slp/assignments'),
  })

export const mutateCreateSlpAssignment = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      audience?: 'all' | 'selected'
      patient_id?: string
      patient_ids?: string[]
      exercise_version_id: string
      schedule?: Record<string, unknown>
    }) =>
      api<{ data: SlpAssignment[] }>('/api/v1/slp/assignments', {
        method: 'POST',
        data: input,
      }),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: slpWorkflowKeys.assignments }),
  })
}

export const mutateCreateSlpConsent = () =>
  useMutation({
    mutationFn: (input: {
      subject_id: string
      purpose: 'slp_recording'
      policy_version: string
    }) => api('/api/v1/slp/consents', { method: 'POST', data: input }),
  })

export const mutateCreateSlpAttempt = (assignmentId: string) => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: { submission_key: string; consent_id: string }) =>
      api<{ data: SlpAttemptStatus }>(
        `/api/v1/slp/assignments/${assignmentId}/attempts`,
        { method: 'POST', data: input },
      ),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: slpWorkflowKeys.assignments }),
  })
}

export const mutateUploadSlpRecording = (attemptId: string) =>
  useMutation({
    mutationFn: (recording: Blob) => {
      const data = new FormData()
      data.append('recording', recording, 'recording.webm')
      return api(`/api/v1/slp/attempts/${attemptId}/recording`, {
        method: 'POST',
        data,
      })
    },
  })

export const fetchSlpAttempt = (attemptId: string) =>
  queryOptions<{ data: SlpAttemptStatus }>({
    queryKey: slpWorkflowKeys.attempt(attemptId),
    queryFn: () => api(`/api/v1/slp/attempts/${attemptId}`),
    refetchInterval: (query) =>
      ['queued', 'running'].includes(
        query.state.data?.data.analysis?.status ?? '',
      )
        ? 2000
        : false,
  })

export const mutateSaveSlpReview = (attemptId: string) =>
  useMutation({
    mutationFn: (input: {
      annotations: Record<string, unknown>[]
      metrics?: Record<string, unknown>
    }) =>
      api(`/api/v1/slp/attempts/${attemptId}/review`, {
        method: 'PUT',
        data: input,
      }),
  })

export const mutateApproveSlpReview = (reviewId: string) =>
  useMutation({
    mutationFn: () =>
      api(`/api/v1/slp/reviews/${reviewId}/approve`, { method: 'POST' }),
  })
