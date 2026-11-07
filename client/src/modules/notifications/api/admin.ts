import { api } from '#/lib/api/client'

export type BroadcastDraft = {
  recipient_ids?: string[]
  roles?: string[]
  channels: Array<'in_app' | 'email'>
  title?: string
  subject?: string
  message: string
}

export const previewNotification = (draft: BroadcastDraft) =>
  api<{
    data: {
      recipients: number
      channels: string[]
      in_app: { title: string; message: string }
      email: { subject: string; message: string }
    }
  }>('/api/v1/notifications/preview', { method: 'POST', data: draft })

export const sendNotification = (draft: BroadcastDraft) =>
  api<{ data: { recipients: number; in_app: number; email: boolean } }>(
    '/api/v1/notifications',
    { method: 'POST', data: draft },
  )
