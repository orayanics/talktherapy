import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useAlert } from '#/context/AlertContext'
import {
  mutateCreateContent,
  mutateUpdateContent,
  mutateDeleteContent,
  mutateBookmarkContent,
  mutateRemoveBookmark,
} from '../api/content'
import type { TContentSchema, TUpdateContentSchema } from '../types/schema'
import { CONTENT } from '#/constants/message'

export const useCreateContent = () => {
  const navigate = useNavigate()
  const { showAlert } = useAlert()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: TContentSchema) => mutateCreateContent(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['content'] })
      await queryClient.invalidateQueries({ queryKey: ['logs'] })
      showAlert(CONTENT.create.success, 'success')
      navigate({ to: '/content' })
    },
  })
}

export const useUpdateContent = (contentId: string) => {
  const navigate = useNavigate()
  const { showAlert } = useAlert()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: TUpdateContentSchema) =>
      mutateUpdateContent(contentId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['content'] })
      await queryClient.invalidateQueries({ queryKey: ['logs'] })
      showAlert(CONTENT.update.success, 'success')
      navigate({ to: '/content/$contentId', params: { contentId } })
    },
  })
}

export const useDeleteContent = (contentId: string) => {
  const navigate = useNavigate()
  const { showAlert } = useAlert()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => mutateDeleteContent(contentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['content'] })
      await queryClient.invalidateQueries({ queryKey: ['logs'] })
      showAlert(CONTENT.delete.success, 'success')
      navigate({ to: '/content' })
    },
  })
}

export const useBookmarkContent = (contentId: string) => {
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: () => mutateBookmarkContent(contentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['content'] })
      showAlert(CONTENT.bookmark.add.success, 'success')
    },
  })
}

export const useRemoveBookmark = (contentId: string) => {
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: () => mutateRemoveBookmark(contentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['content'] })
      showAlert(CONTENT.bookmark.remove.success, 'success')
    },
  })
}
