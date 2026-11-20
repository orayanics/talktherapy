import { useMutation } from '@tanstack/react-query'

import { useNavigate } from '@tanstack/react-router'

import { useAlert } from '#/context/AlertContext'

import { ACTIVATE_ACCOUNT } from '#/constants/message'

import {
  mutateVerifyOtp,
  mutateResendOtp,
  mutateActivateAccount,
} from '../api/activate'

export const useVerifyOtpMutation = () => {
  return useMutation({
    mutationFn: mutateVerifyOtp,
  })
}

export const useResendOtpMutation = () => {
  return useMutation({
    mutationFn: mutateResendOtp,
  })
}

export const useActivateAccountMutation = () => {
  const navigate = useNavigate()
  const { showAlert } = useAlert()
  return useMutation({
    mutationFn: mutateActivateAccount,
    onSuccess: async () => {
      showAlert(ACTIVATE_ACCOUNT.success, 'success')
      navigate({ to: '/login' })
    },
  })
}
