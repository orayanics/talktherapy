import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'

import { LoginSchema } from '../types/schema'
import type { TLogin } from '../types/schema'

import { api, initializeCsrf } from '#/lib/api/client'
import { errMsg } from '#/lib/errorMessage'

export default function useLoginForm() {
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TLogin>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    setApiError(null)
    try {
      await initializeCsrf()
      await api('/login', { method: 'POST', data })
      window.location.href = '/dashboard'
    } catch (error: unknown) {
      setApiError(errMsg(error, 'Login failed'))
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
