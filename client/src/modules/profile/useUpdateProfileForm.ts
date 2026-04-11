import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { useState } from 'react'

import { ProfileSchema } from './schema'
import type { TProfileUpdate } from './schema'

import { mutateUpdateProfile } from '@/api/users'
import { useAlert } from '@/context/AlertContext'

export default function useUpdateProfileForm(
  id: string,
  defaultValues?: Partial<TProfileUpdate>,
) {
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TProfileUpdate>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
    },
  })

  const { showAlert } = useAlert()

  const updateMutation = mutateUpdateProfile(id)

  const onSubmit = handleSubmit(async (data) => {
    setApiError(null)

    try {
      await updateMutation.mutateAsync(data)
      showAlert('Profile updated', 'success')
      reset(data)
    } catch (error: any) {
      if (isAxiosError(error)) {
        const message = error.response?.data.message || 'Update failed'
        setApiError(message)
      } else {
        setApiError(error.message)
      }
    }
  })

  return {
    register,
    onSubmit,
    errors,
    apiError,
    isLoading: updateMutation.isPending || isSubmitting,
    reset,
  }
}
