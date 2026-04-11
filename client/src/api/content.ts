import { api } from './client'
import {
  useMutation,
  queryOptions,
  useQueryClient,
} from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import type { QueryParams, ContentParams, Meta } from '@/types/params'
import { useAlert } from '@/context/AlertContext'
import type {
  TContentSchema,
  TUpdateContentSchema,
} from '@/modules/content/schema'

import { CONTENT } from '@/constants/message'

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface Content {
  id: string
  author_id: string
  diagnosis_id: string
  title: string
  description: string
  body: string
  is_bookmarked: boolean
  created_at: string
  updated_at: string

  author: {
    id: string
    name: string
    email: string
  }

  diagnosis: {
    id: string
    value: string
    label: string
  }

  tags: { tag: Tag }[]
}

export interface ContentTag {
  content_id: string
  tag_id: string
}

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface Bookmark {
  id: string
  user_id: string
  content_id: string
  created_at: string
}

export const fetchContentList = (
  params: QueryParams = {},
  searchParams: ContentParams = {},
) => {
  const query = {
    page: params.page,
    search: searchParams.search,
    diagnosis_id: searchParams.diagnosis,
    sort: searchParams.sort,
    is_bookmarked: searchParams.is_bookmarked,
  }

  return queryOptions<{
    data: Content[]
    meta: Meta
  }>({
    queryKey: ['content', query],
    queryFn: async () => {
      const data = await api('/content', {
        method: 'GET',
        params: query,
      })
      return data
    },
    staleTime: 1000 * 60 * 30,
  })
}

export const fetchContentById = (contentId: string) => {
  return queryOptions<Content>({
    queryKey: ['content', contentId],
    queryFn: async () => {
      const { data } = await api(`/content/${contentId}`, {
        method: 'GET',
      })
      return data
    },
    staleTime: 1000 * 60 * 30,
  })
}

export const mutateCreateContent = () => {
  const navigate = useNavigate()
  const { showAlert } = useAlert()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: TContentSchema) => {
      const { data } = await api('/content', {
        method: 'POST',
        data: JSON.stringify(payload),
      })
      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['content'] })
      await queryClient.invalidateQueries({ queryKey: ['logs'] })
      showAlert(CONTENT.create.success, 'success')
      navigate({ to: '/content' })
    },
  })
}

export const mutateUpdateContent = (contentId: string) => {
  const navigate = useNavigate()
  const { showAlert } = useAlert()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: TUpdateContentSchema) => {
      const { data } = await api(`/content/${contentId}`, {
        method: 'PATCH',
        data: JSON.stringify(payload),
      })
      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['content'] })
      await queryClient.invalidateQueries({ queryKey: ['logs'] })
      showAlert(CONTENT.update.success, 'success')
      navigate({ to: '/content/$contentId', params: { contentId } })
    },
  })
}

export const mutateDeleteContent = (contentId: string) => {
  const navigate = useNavigate()
  const { showAlert } = useAlert()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await api(`/content/${contentId}`, {
        method: 'DELETE',
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['content'] })
      await queryClient.invalidateQueries({ queryKey: ['logs'] })
      showAlert(CONTENT.delete.success, 'success')
      navigate({ to: '/content' })
    },
  })
}

export const mutateBookmarkContent = (contentId: string) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: async () => {
      await api(`/content/${contentId}/bookmark`, {
        method: 'POST',
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['content'] })
      showAlert(CONTENT.bookmark.add.success, 'success')
      navigate({ to: '/content' })
    },
  })
}

export const mutateRemoveBookmark = (contentId: string) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: async () => {
      await api(`/content/${contentId}/bookmark`, {
        method: 'DELETE',
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['content'] })
      showAlert(CONTENT.bookmark.remove.success, 'success')
      navigate({ to: '/content' })
    },
  })
}
