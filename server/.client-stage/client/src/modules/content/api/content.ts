import { api } from '#/lib/api/client'
import {
    useMutation,
    queryOptions,
    useQueryClient,
} from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import type { QueryParams, Meta } from '#/types/api'
import type { ContentParams } from '#/modules/content/types/params'
import { useAlert } from '#/context/AlertContext'
import type {
    TContentSchema,
    TUpdateContentSchema,
} from '#/modules/content/types/schema'

import { CONTENT } from '#/constants/message'
import type { DiagnosisItem } from '#/modules/diagnoses/api/diagnoses'

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
        queryFn: () =>
            api<{ data: Content[]; meta: Meta }>(path, {
                method: 'GET',
                params: query,
            }),
        staleTime: 1000 * 60 * 30,
    })
}

export const fetchContentById = (contentId: string) => {
    return queryOptions<Content>({
        queryKey: ['content', contentId],
        queryFn: async () => {
            const response = await api<{ data: Content }>(
                `/api/v1/content/${contentId}`,
                {
                    method: 'GET',
                },
            )
            return response.data
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
            const { data } = await api('/api/v1/content', {
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
            const { data } = await api(`/api/v1/content/${contentId}`, {
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
            await api(`/api/v1/content/${contentId}`, {
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
    const queryClient = useQueryClient()
    const { showAlert } = useAlert()

    return useMutation({
        mutationFn: async () => {
            await api(`/api/v1/content/${contentId}/bookmark`, {
                method: 'PUT',
            })
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['content'] })
            showAlert(CONTENT.bookmark.add.success, 'success')
        },
    })
}

export const mutateRemoveBookmark = (contentId: string) => {
    const queryClient = useQueryClient()
    const { showAlert } = useAlert()

    return useMutation({
        mutationFn: async () => {
            await api(`/api/v1/content/${contentId}/bookmark`, {
                method: 'DELETE',
            })
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['content'] })
            showAlert(CONTENT.bookmark.remove.success, 'success')
        },
    })
}
