import { useMutation } from '@tanstack/react-query'
import { api } from '#/lib/api/client'

export type BroadcastDraft = {
  recipient_ids?: string[]
  roles?: string[]
  channels: Array<'in_app' | 'email'>
  title?: string
  subject?: string
  message: string
}

export function useAdminNotificationComposer() {
  const preview = useMutation({ mutationFn: (draft: BroadcastDraft) => api<{ data: { recipients: number; channels: string[]; in_app: { title: string; message: string }; email: { subject: string; message: string } } }>('/api/v1/notifications/preview', { method: 'POST', data: draft }) })
  const send = useMutation({ mutationFn: (draft: BroadcastDraft) => api<{ data: { recipients: number; in_app: number; email: boolean } }>('/api/v1/notifications', { method: 'POST', data: draft }) })
  return { preview, send }
}
