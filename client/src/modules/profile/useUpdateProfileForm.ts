import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { useState } from 'react'

import { ProfileSchema } from './schema'
import type { TProfileUpdate } from './schema'

import { useAlert } from '@/context/AlertContext'
import { api } from '@/api/client'

export default function useUpdateProfileForm(defaultValues?: {
  name?: string
  email?: string
}) {
  const [apiError, setApiError] = useState<string | null>(null)
  const { showAlert } = useAlert()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TProfileUpdate>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    setApiError(null)

    try {
      await api('/api/v1/me', { method: 'PATCH', data: { name: data.name } })

      if (data.email && data.email !== defaultValues?.email) {
        await api('/api/v1/me/email-change', {
          method: 'POST',
          data: { new_email: data.email, current_password: data.currentPassword },
        })
      }

      if (data.currentPassword && data.newPassword) {
        await api('/api/v1/me/password', {
          method: 'POST',
          data: {
            current_password: data.currentPassword,
            password: data.newPassword,
            password_confirmation: data.confirmPassword,
          },
        })
      }

      showAlert('Profile updated', 'success')
      reset({
        name: data.name,
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error: any) {
      if (isAxiosError(error)) {
        setApiError(error.response?.data.message ?? 'Update failed')
      } else {
        setApiError(error.message ?? 'An error occurred')
      }
    }
  })

  return {
    register,
    onSubmit,
    errors,
    apiError,
    isLoading: isSubmitting,
  }
}
