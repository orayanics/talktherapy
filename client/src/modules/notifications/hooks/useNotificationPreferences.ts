import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchNotificationPreferences,
  mutateNotificationPreferences,
} from '../api/preferences'

export function useNotificationPreferences() {
  const queryClient = useQueryClient()
  const query = useQuery(fetchNotificationPreferences)
  const mutation = useMutation({
    mutationFn: mutateNotificationPreferences,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: fetchNotificationPreferences.queryKey,
      }),
  })
  return {
    ...query,
    update: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  }
}
