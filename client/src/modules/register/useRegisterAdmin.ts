import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { useState } from 'react'

import { RegisterAdminSchema } from './schema'
import type { TRegisterAdmin } from './schema'

import { mutateRegisterAdmin } from '@/api/register'

export default function useRegisterAdmin() {
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TRegisterAdmin>({
    resolver: zodResolver(RegisterAdminSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  const registerMutation = mutateRegisterAdmin()

  const onSubmit = handleSubmit(async (data) => {
    setApiError(null)

    try {
      await registerMutation.mutateAsync(data)
    } catch (error: any) {
      if (isAxiosError(error)) {
        const message = error.response?.data.message || 'Register admin failed'
        setApiError(message)
      } else {
        setApiError(error.message)
      }
    }
  })

  return {
    register,
    reset,
    onSubmit,
    errors,
    apiError,
    isLoading: registerMutation.isPending || isSubmitting,
  }
}
