import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { isAxiosError } from 'axios'

import { api } from '~/api/axios'
import { CONTENT } from '~/config/message'
import { useAlert } from '~/context/AlertContext'

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

export const contentListQueryOptions = (params: ContentListParams) =>
  queryOptions({
    queryKey: ['content', 'list', params],
    queryFn: async () => {
      const { data } = await api.get('/content', {
        params: {
          search: params.search || undefined,
          diagnosis_id: params.diagnosis?.length ? params.diagnosis : undefined,
          page: params.page ?? 1,
          per_page: params.perPage ?? 10,
        },
      })
      return data
    },
    placeholderData: (prev) => prev,
  })

export const contentDetailQueryOptions = (contentId: string) =>
  queryOptions({
    queryKey: ['content', contentId],
    queryFn: async () => {
      const { data } = await api.get(`/content/${contentId}`)
      return data
    },
    staleTime: 1000 * 60 * 5,
  })

export const useCreateContent = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: async (payload: CreateContentPayload) => {
      const { data } = await api.post('/content', payload)
      return data
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['content', 'list'] })
      showAlert(CONTENT.create.success, 'success')
      navigate({ to: '/content/$contentId', params: { contentId: data.id } })
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.error('Failed to create content:', error.response?.data)
      }
      showAlert(CONTENT.create.error, 'error')
    },
  })
}

export const useUpdateContentId = (contentId: string) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: async (payload: UpdateContentPayload) => {
      const { data } = await api.patch(`/content/${contentId}`, payload)
      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['content', 'list'] })
      await queryClient.invalidateQueries({ queryKey: ['content', contentId] })
      showAlert(CONTENT.update.success, 'success')
      navigate({ to: '/content/$contentId', params: { contentId } })
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.error('Failed to update content:', error.response?.data)
      }
      showAlert(CONTENT.update.error, 'error')
    },
  })
}

export const useDeleteContentId = (contentId: string) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete(`/content/${contentId}`)
      return data
    },
    onSuccess: async () => {
      navigate({ to: '/content' })
      await queryClient.invalidateQueries({ queryKey: ['content', 'list'] })
      showAlert(CONTENT.delete.success, 'success')
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.error('Failed to delete content:', error.response?.data)
      }
      showAlert(CONTENT.delete.error, 'error')
    },
  })
}
