import { api } from '#/lib/api/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import type {
  TRegisterPatient,
  TRegisterAdmin,
  TRegisterClinician,
} from '#/modules/register/types/schema'

import { useAlert } from '#/context/AlertContext'

export const mutateRegisterPatient = () => {
  const navigate = useNavigate()
  const { showAlert } = useAlert()
  return useMutation({
    mutationFn: async (payload: TRegisterPatient) => {
      const { data } = await api('/api/v1/registrations/patient', {
        method: 'POST',
        data: JSON.stringify(payload),
      })
      return data
    },
    onSuccess: async () => {
      showAlert('Registration successful. OTP sent to your email.', 'success')
      navigate({
        to: '/activate/otp',
      })
    },
  })
}

export const mutateRegisterClinician = () => {
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()
  return useMutation({
    mutationFn: async (payload: TRegisterClinician) => {
      const { data } = await api('/api/v1/users', {
        method: 'POST',
        data: JSON.stringify({ ...payload, role: 'clinician' }),
      })
      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      await queryClient.invalidateQueries({ queryKey: ['users-count'] })

      await queryClient.invalidateQueries({ queryKey: ['logs'] })

      showAlert('User created. OTP sent to the user email.', 'success')
    },
  })
}

export const mutateRegisterAdmin = () => {
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()
  return useMutation({
    mutationFn: async (payload: TRegisterAdmin) => {
      const { data } = await api('/api/v1/users', {
        method: 'POST',
        data: JSON.stringify({ ...payload, role: 'admin' }),
      })
      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      await queryClient.invalidateQueries({ queryKey: ['users-count'] })
      await queryClient.invalidateQueries({ queryKey: ['logs'] })

      showAlert('User created. OTP sent to the user email.', 'success')
    },
  })
}
