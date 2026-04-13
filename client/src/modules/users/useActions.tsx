import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'

export default function useActions() {
  const queryClient = useQueryClient()

  const banUserMutation = useMutation({
    mutationKey: ['ban-user'],
    mutationFn: async (userId: string) => {
      const { data } = await api('/auth/ban', {
        method: 'POST',
        data: JSON.stringify({ userId }),
      })
      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      await queryClient.invalidateQueries({ queryKey: ['users-count'] })
      await queryClient.invalidateQueries({ queryKey: ['logs'] })
    },
  })

  const unbanUserMutation = useMutation({
    mutationKey: ['unban-user'],
    mutationFn: async (userId: string) => {
      const { data } = await api('/auth/unban', {
        method: 'POST',
        data: JSON.stringify({ userId }),
      })
      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      await queryClient.invalidateQueries({ queryKey: ['users-count'] })
      await queryClient.invalidateQueries({ queryKey: ['logs'] })
    },
  })

  async function handleBanUser(userId: string) {
    await banUserMutation.mutateAsync(userId)
  }

  async function handleUnbanUser(userId: string) {
    await unbanUserMutation.mutateAsync(userId)
  }

  return { handleBanUser, handleUnbanUser }
}
