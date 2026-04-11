import { api } from './client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { TLogin } from '@/modules/login/schema'

import { useAlert } from '@/context/AlertContext'
import { LOGIN, LOGOUT } from '@/constants/message'

export const mutateLogin = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: async (payload: TLogin) => {
      const data = await api('/auth/api/sign-in/email', {
        method: 'POST',
        data: JSON.stringify(payload),
        withCredentials: true,
      })
      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['session'] })
      showAlert(LOGIN.success, 'success')
      navigate({ to: '/dashboard' })
    },
  })
}

export const mutateLogout = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: async () => {
      await api('/auth/api/sign-out', {
        method: 'POST',
        withCredentials: true,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['session'] })
      await queryClient.removeQueries()
      showAlert(LOGOUT.success, 'success')
      navigate({ to: '/login' })
    },
  })
}
