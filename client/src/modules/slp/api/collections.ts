import { queryOptions } from '@tanstack/react-query'
import { api } from '#/lib/api/client'
import type { Meta } from '#/types/api'

export interface ExerciseCollection {
  id: string
  owner_id: string
  can_manage: boolean
  patient_audience: 'assigned' | 'selected' | 'clinician' | 'platform'
  patient_ids?: string[]
  title: string
  description: string | null
  cover_url: string | null
  is_hidden: boolean
  exercises_count?: number
  updated_at: string
}

export interface PracticeExercise {
  id: string
  exercise_id: string
  prompt_text: string
  language: string
  dialect: string | null
  task_type: string
  assignment_id: string | null
}

export const fetchCollectionPractice = (id: string, page = 1) =>
  queryOptions({
    queryKey: [...collectionKeys, id, 'practice', page],
    queryFn: () =>
      api<{ data: PracticeExercise[]; meta: Meta }>(
        `/api/v1/slp/collections/${id}/practice`,
        { params: { page } },
      ),
  })

export const collectionKeys = ['slp-collections'] as const

export const fetchCollections = (page = 1) =>
  queryOptions({
    queryKey: [...collectionKeys, page],
    queryFn: () =>
      api<{ data: ExerciseCollection[]; meta: Meta }>(
        '/api/v1/slp/collections',
        { params: { page } },
      ),
  })

export const saveCollection = (data: FormData, id?: string) => {
  if (id) data.set('_method', 'PATCH')
  return api<{ data: ExerciseCollection }>(
    `/api/v1/slp/collections${id ? `/${id}` : ''}`,
    { method: 'POST', data },
  )
}

export const deleteCollection = (id: string) =>
  api<void>(`/api/v1/slp/collections/${id}`, { method: 'DELETE' })
