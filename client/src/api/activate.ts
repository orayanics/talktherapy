import { api } from './client'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import type { TVerifyOtp, TActivateAccount } from '@/modules/activation/schema'

import { useAlert } from '@/context/AlertContext'
import { ACTIVATE_ACCOUNT } from '@/constants/message'

export const mutateVerifyOtp = () => {
  return useMutation({
    mutationFn: async (payload: TVerifyOtp) => {
      const data = await api('/otp/verify', {
        method: 'POST',
        data: JSON.stringify(payload),
      })
      return data
    },
  })
}

export const mutateActivateAccount = () => {
  const navigate = useNavigate()
  const { showAlert } = useAlert()
  return useMutation({
    mutationFn: async (payload: TActivateAccount) => {
      const data = await api('/activate', {
        method: 'POST',
        data: JSON.stringify(payload),
      })
      return data
    },
    onSuccess: async () => {
      showAlert(ACTIVATE_ACCOUNT.success, 'success')
      navigate({ to: '/login' })
    },
  })
}
