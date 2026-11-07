import { queryOptions } from '@tanstack/react-query'
import { retryApiQuery } from '#/lib/api/query'
import { api } from '#/lib/api/client'

export type NotificationPreferences = { in_app: boolean; email: boolean }

export const fetchNotificationPreferences = queryOptions({
  queryKey: ['notification-preferences'],
  retry: retryApiQuery,
  queryFn: async ({ signal }) =>
    (
      await api<{ data: NotificationPreferences }>(
        '/api/v1/me/notification-preferences',
        { signal },
      )
    ).data,
})

export const mutateNotificationPreferences = (
  preferences: NotificationPreferences,
) =>
  api('/api/v1/me/notification-preferences', {
    method: 'PUT',
    data: preferences,
  })
