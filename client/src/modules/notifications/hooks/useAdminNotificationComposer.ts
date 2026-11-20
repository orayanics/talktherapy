import { useMutation } from '@tanstack/react-query'
import { previewNotification, sendNotification } from '../api/admin'

export function useAdminNotificationComposer() {
  const preview = useMutation({ mutationFn: previewNotification })
  const send = useMutation({ mutationFn: sendNotification })
  return { preview, send }
}
