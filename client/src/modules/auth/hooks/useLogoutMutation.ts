import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutateSignOut } from '../api/auth-client'

export function useLogoutMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: mutateSignOut,
    onSuccess: () => queryClient.clear(),
  })
}
