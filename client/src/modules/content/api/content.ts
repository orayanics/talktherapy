import { retryApiQuery } from '#/lib/api/query'
import { api } from '#/lib/api/client'
import { queryOptions } from '@tanstack/react-query'

import type { QueryParams, Meta } from '#/types/api'
import type { ContentParams } from '#/modules/content/types/params'
import type {
  TContentSchema,
  TUpdateContentSchema,
} from '#/modules/content/types/schema'

import type { DiagnosisItem } from '#/modules/diagnoses/types/diagnosis'

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface Content {
  id: string
  title: string
  description: string
  body: string
  is_bookmarked: boolean
  created_at: string
  updated_at: string

  author: {
    id: string
    name: string
  }

  diagnosis: DiagnosisItem | null

  tags: Tag[]
}

export const fetchContentList = (
  params: QueryParams = {},
  searchParams: ContentParams = {},
) => {
  const query = {
    page: params.page,
    search: searchParams.search,
    diagnosis: searchParams.diagnosis,
    sort: searchParams.sort,
  }
  const path = searchParams.is_bookmarked
    ? '/api/v1/bookmarks'
    : '/api/v1/content'

  return queryOptions<{
    data: Content[]
    meta: Meta
  }>({
    queryKey: ['content', path, query],
    retry: retryApiQuery,
    queryFn: ({ signal }) =>
      api<{ data: Content[]; meta: Meta }>(path, {
        method: 'GET',
        signal,
        params: query,
      }),
    staleTime: 1000 * 60 * 30,
  })
}

export const fetchContentById = (contentId: string) => {
  return queryOptions<Content>({
    queryKey: ['content', contentId],
    retry: retryApiQuery,
    queryFn: async ({ signal }) => {
      const response = await api<{ data: Content }>(
        `/api/v1/content/${contentId}`,
        {
          method: 'GET',
          signal,
        },
      )
      return response.data
    },
    staleTime: 1000 * 60 * 30,
  })
}

export const mutateCreateContent = async (payload: TContentSchema) => {
  const { data } = await api<{ data: Content }>('/api/v1/content', {
    method: 'POST',
    data: payload,
  })
  return data
}

export const mutateUpdateContent = async (
  contentId: string,
  payload: TUpdateContentSchema,
) => {
  const { data } = await api<{ data: Content }>(
    `/api/v1/content/${contentId}`,
    {
      method: 'PATCH',
      data: payload,
    },
  )
  return data
}

export const mutateDeleteContent = async (contentId: string) => {
  await api(`/api/v1/content/${contentId}`, {
    method: 'DELETE',
  })
}

export const mutateBookmarkContent = async (contentId: string) => {
  await api(`/api/v1/content/${contentId}/bookmark`, {
    method: 'PUT',
  })
}

export const mutateRemoveBookmark = async (contentId: string) => {
  await api(`/api/v1/content/${contentId}/bookmark`, {
    method: 'DELETE',
  })
}
