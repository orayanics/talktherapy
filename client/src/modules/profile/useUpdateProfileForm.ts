import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { useState } from 'react'

import { ProfileSchema } from './schema'
import type { TProfileUpdate } from './schema'

import { useAlert } from '@/context/AlertContext'
import { authClient } from '@/utils/auth-client'

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
      await authClient.updateUser({ name: data.name })

      if (data.email && data.email !== defaultValues?.email) {
        const { error } = await authClient.changeEmail({ newEmail: data.email })
        if (error) throw new Error(error.message ?? 'Email update failed')
      }

      if (data.currentPassword && data.newPassword) {
        const { error } = await authClient.changePassword({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          revokeOtherSessions: false,
        })
        if (error) throw new Error(error.message ?? 'Password update failed')
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
