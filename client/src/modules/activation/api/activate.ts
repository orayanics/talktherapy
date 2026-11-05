import type { USER_ROLE, ACCOUNT_STATUS } from '#/modules/auth/types/account'
import { api } from '#/lib/api/client'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import type {
  TVerifyOtp,
  TActivateAccount,
  TResendOtp,
} from '#/modules/activation/types/schema'

import { useAlert } from '#/context/AlertContext'
import { ACTIVATE_ACCOUNT } from '#/constants/message'

export const mutateVerifyOtp = () => {
  return useMutation({
    mutationFn: async (payload: TVerifyOtp) => {
      const response = await api<{
        data: { role: USER_ROLE; requires_credentials: boolean }
      }>('/api/v1/activation/otp/verify', {
        method: 'POST',
        data: JSON.stringify(payload),
      })
      return response.data
    },
  })
}

export const mutateResendOtp = () => {
  return useMutation({
    mutationFn: async (payload: TResendOtp) => {
      await api('/api/v1/activation/otp/resend', {
        method: 'POST',
        data: JSON.stringify(payload),
      })
    },
  })
}

export const mutateActivateAccount = () => {
  const navigate = useNavigate()
  const { showAlert } = useAlert()
  return useMutation({
    mutationFn: async (payload: TActivateAccount) => {
      const response = await api<{ data: { status: ACCOUNT_STATUS } }>(
        '/api/v1/activation',
        {
          method: 'POST',
          data: JSON.stringify(payload),
        },
      )
      return response.data
    },
    onSuccess: async () => {
      showAlert(ACTIVATE_ACCOUNT.success, 'success')
      navigate({ to: '/login' })
    },
  })
}
