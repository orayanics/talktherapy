import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '#/lib/api/client'

export type NotificationPreferences = { in_app: boolean; email: boolean }
const key = ['notification-preferences']

export function useNotificationPreferences() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: key, queryFn: async () => (await api<{ data: NotificationPreferences }>('/api/v1/me/notification-preferences')).data })
  const mutation = useMutation({ mutationFn: (preferences: NotificationPreferences) => api('/api/v1/me/notification-preferences', { method: 'PUT', data: preferences }), onSuccess: () => queryClient.invalidateQueries({ queryKey: key }) })
  return { ...query, update: mutation.mutateAsync, isUpdating: mutation.isPending }
}
