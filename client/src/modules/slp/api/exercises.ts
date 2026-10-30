import { useMutation, useQueryClient, queryOptions } from '@tanstack/react-query'
import { api } from '#/lib/api/client'

export type SlpExerciseModule =
  | 'fluency'
  | 'timing'
  | 'articulation'
  | 'aphasia'
  | 'voice'
  | 'motor_speech'

export interface SlpExerciseVersion {
  id: string
  revision: number
  language: string
  dialect: string | null
  task_type: string
  status: 'draft' | 'reviewed' | 'published'
  prompt_text: string
  configuration: Record<string, unknown> | null
}

export interface SlpExercise {
  id: string
  owner_id: string
  scope: 'private' | 'shared'
  module: SlpExerciseModule
  archived_at: string | null
  latest_version: SlpExerciseVersion | null
  created_at: string
  updated_at: string
}

export interface SlpExerciseInput {
  scope?: 'private' | 'shared'
  module: SlpExerciseModule
  language: string
  dialect?: string | null
  task_type: string
  prompt_text: string
  configuration?: Record<string, unknown>
}

type ExerciseResponse = { data: SlpExercise }
type ExerciseListResponse = { data: SlpExercise[]; meta: Record<string, unknown> }

export const slpExerciseKeys = {
  all: ['slp-exercises'] as const,
  list: (page = 1) => ['slp-exercises', 'list', page] as const,
  detail: (id: string) => ['slp-exercises', id] as const,
}

export const fetchSlpExercises = (page = 1) => queryOptions<ExerciseListResponse>({
  queryKey: slpExerciseKeys.list(page),
  queryFn: () => api<ExerciseListResponse>('/api/v1/slp/exercises', { method: 'GET', params: { page } }),
})

export const mutateCreateSlpExercise = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SlpExerciseInput) => api<ExerciseResponse>('/api/v1/slp/exercises', { method: 'POST', data: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: slpExerciseKeys.all }),
  })
}

export const mutateUpdateSlpExercise = (id: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<SlpExerciseInput>) => api<ExerciseResponse>(`/api/v1/slp/exercises/${id}`, { method: 'PATCH', data: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: slpExerciseKeys.all }),
  })
}

export const mutateArchiveSlpExercise = (id: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api<void>(`/api/v1/slp/exercises/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: slpExerciseKeys.all }),
  })
}
