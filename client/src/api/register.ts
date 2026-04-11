import { api } from './client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import type {
  TRegisterPatient,
  TRegisterAdmin,
  TRegisterClinician,
} from '@/modules/register/schema'

import { useAlert } from '@/context/AlertContext'
import { USER } from '@/constants/message'

export const mutateRegisterPatient = () => {
  const navigate = useNavigate()
  const { showAlert } = useAlert()
  return useMutation({
    mutationFn: async (payload: TRegisterPatient) => {
      const { data } = await api('/register/patient', {
        method: 'POST',
        data: JSON.stringify(payload),
      })
      return data
    },
    onSuccess: async () => {
      showAlert(USER.create.success, 'success')
      navigate({ to: '/login' })
    },
  })
}

export const mutateRegisterClinician = () => {
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()
  return useMutation({
    mutationFn: async (payload: TRegisterClinician) => {
      const { data } = await api('/register/clinician', {
        method: 'POST',
        data: JSON.stringify(payload),
      })
      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      await queryClient.invalidateQueries({ queryKey: ['users-count'] })

      await queryClient.invalidateQueries({ queryKey: ['logs'] })

      showAlert(USER.create.success, 'success')
    },
  })
}

export const mutateRegisterAdmin = () => {
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()
  return useMutation({
    mutationFn: async (payload: TRegisterAdmin) => {
      const { data } = await api('/register/admin', {
        method: 'POST',
        data: JSON.stringify(payload),
      })
      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      await queryClient.invalidateQueries({ queryKey: ['users-count'] })
      await queryClient.invalidateQueries({ queryKey: ['logs'] })

      showAlert(USER.create.success, 'success')
    },
  })
}
