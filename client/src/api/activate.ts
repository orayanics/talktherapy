import { api } from './client'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import type {
  TVerifyOtp,
  TActivateAccount,
  TResendOtp,
} from '@/modules/activation/schema'

import { useAlert } from '@/context/AlertContext'
import { ACTIVATE_ACCOUNT } from '@/constants/message'

export const mutateVerifyOtp = () => {
  return useMutation({
    mutationFn: async (payload: TVerifyOtp) => {
      const response = await api<{ success: boolean; data: any }>(
        '/otp/verify',
        {
          method: 'POST',
          data: JSON.stringify(payload),
        },
      )
      return response.data
    },
  })
}

export const mutateResendOtp = () => {
  return useMutation({
    mutationFn: async (payload: TResendOtp) => {
      const response = await api<{ success: boolean; data: any }>(
        '/otp/resend',
        {
          method: 'POST',
          data: JSON.stringify(payload),
        },
      )
      return response.data
    },
  })
}

export const mutateActivateAccount = () => {
  const navigate = useNavigate()
  const { showAlert } = useAlert()
  return useMutation({
    mutationFn: async (payload: TActivateAccount) => {
      const response = await api<{ success: boolean; data: any }>('/activate', {
        method: 'POST',
        data: JSON.stringify(payload),
      })
      return response.data
    },
    onSuccess: async () => {
      showAlert(ACTIVATE_ACCOUNT.success, 'success')
      navigate({ to: '/login' })
    },
  })
}
