import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { sessionQueryOptions } from '#/modules/auth/lib/session-query'

import { ProfileSchema } from '../types/schema'
import type { TProfileUpdate } from '../types/schema'

import { useAlert } from '#/context/AlertContext'
import { api } from '#/lib/api/client'
import { errMsg } from '#/lib/errorMessage'

export default function useUpdateProfileForm(defaultValues?: {
  name?: string
  email?: string
}) {
  const queryClient = useQueryClient()
  const router = useRouter()
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
          data: {
            new_email: data.email,
            current_password: data.currentPassword,
          },
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

      await queryClient.invalidateQueries({
        queryKey: sessionQueryOptions.queryKey,
        refetchType: 'none',
      })
      await router.invalidate()
      showAlert('Profile updated', 'success')
      reset({
        name: data.name,
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error: unknown) {
      setApiError(errMsg(error, 'Update failed'))
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
