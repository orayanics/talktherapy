import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '#/lib/api/client'

export default function useActions() {
  const queryClient = useQueryClient()

  const statusMutation = useMutation({
    mutationKey: ['user-status'],
    mutationFn: async ({
      userId,
      status,
      reason,
    }: {
      userId: string
      status: 'active' | 'suspended'
      reason?: string
    }) => {
      return api(`/api/v1/users/${userId}/status`, {
        method: 'PATCH',
        data: { status, reason },
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      await queryClient.invalidateQueries({ queryKey: ['users-count'] })
      await queryClient.invalidateQueries({ queryKey: ['logs'] })
    },
  })

  async function suspendUser(userId: string, reason: string) {
    await statusMutation.mutateAsync({ userId, status: 'suspended', reason })
  }

  async function reactivateUser(userId: string) {
    await statusMutation.mutateAsync({ userId, status: 'active' })
  }

  return { suspendUser, reactivateUser }
}
