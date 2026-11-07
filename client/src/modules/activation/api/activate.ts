import type { USER_ROLE, ACCOUNT_STATUS } from '#/modules/auth/types/account'

import { api } from '#/lib/api/client'

import type {
  TVerifyOtp,
  TActivateAccount,
  TResendOtp,
} from '#/modules/activation/types/schema'

export const mutateVerifyOtp = async (payload: TVerifyOtp) => {
  const response = await api<{
    data: { role: USER_ROLE; requires_credentials: boolean }
  }>('/api/v1/activation/otp/verify', {
    method: 'POST',
    data: JSON.stringify(payload),
  })
  return response.data
}

export const mutateResendOtp = async (payload: TResendOtp) => {
  await api('/api/v1/activation/otp/resend', {
    method: 'POST',
    data: JSON.stringify(payload),
  })
}

export const mutateActivateAccount = async (payload: TActivateAccount) => {
  const response = await api<{ data: { status: ACCOUNT_STATUS } }>(
    '/api/v1/activation',
    {
      method: 'POST',
      data: JSON.stringify(payload),
    },
  )
  return response.data
}
