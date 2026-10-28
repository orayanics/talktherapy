import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '#/lib/api/client'

export default function useActions() {
  const queryClient = useQueryClient()

  const statusMutation = useMutation({
    mutationKey: ['user-status'],
    mutationFn: async ({
      userId,
      status,
    }: {
      userId: string
      status: 'active' | 'suspended'
    }) => {
      return api(`/api/v1/users/${userId}/status`, {
        method: 'PATCH',
        data: { status },
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      await queryClient.invalidateQueries({ queryKey: ['users-count'] })
      await queryClient.invalidateQueries({ queryKey: ['logs'] })
    },
  })

  async function suspendUser(userId: string) {
    await statusMutation.mutateAsync({ userId, status: 'suspended' })
  }

  async function reactivateUser(userId: string) {
    await statusMutation.mutateAsync({ userId, status: 'active' })
  }

  return { suspendUser, reactivateUser }
}
