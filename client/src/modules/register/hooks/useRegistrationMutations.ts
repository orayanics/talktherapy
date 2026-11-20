import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useNavigate } from '@tanstack/react-router'

import { useAlert } from '#/context/AlertContext'

import {
  mutateRegisterPatient,
  mutateRegisterClinician,
  mutateRegisterAdmin,
  mutateRegisterPatientInvitation,
} from '../api/register'

export const useRegisterPatientMutation = () => {
  const navigate = useNavigate()
  const { showAlert } = useAlert()
  return useMutation({
    mutationFn: mutateRegisterPatient,
    onSuccess: async () => {
      showAlert('Registration successful. OTP sent to your email.', 'success')
      navigate({
        to: '/activate/otp',
      })
    },
  })
}

export const useRegisterClinicianMutation = () => {
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()
  return useMutation({
    mutationFn: mutateRegisterClinician,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['users'] }),
        queryClient.invalidateQueries({ queryKey: ['users-count'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] }),
        queryClient.invalidateQueries({ queryKey: ['logs'] }),
      ])

      showAlert('User created. OTP sent to the user email.', 'success')
    },
  })
}

export const useRegisterAdminMutation = () => {
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()
  return useMutation({
    mutationFn: mutateRegisterAdmin,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['users'] }),
        queryClient.invalidateQueries({ queryKey: ['users-count'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] }),
        queryClient.invalidateQueries({ queryKey: ['logs'] }),
      ])

      showAlert('User created. OTP sent to the user email.', 'success')
    },
  })
}

export const useRegisterPatientInvitationMutation = () => {
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()
  return useMutation({
    mutationFn: mutateRegisterPatientInvitation,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['users'] }),
        queryClient.invalidateQueries({ queryKey: ['users-count'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] }),
        queryClient.invalidateQueries({ queryKey: ['logs'] }),
      ])
      showAlert('Patient invited. OTP sent to the user email.', 'success')
    },
  })
}
