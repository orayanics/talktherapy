import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { useState } from 'react'

import { LoginSchema } from './schema'
import type { TLogin } from './schema'

import { mutateLogin } from '@/api/auth'
import { authClient } from '@/utils/auth-client'

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

  const loginMutation = mutateLogin()

  const onSubmit = handleSubmit(async (data) => {
    setApiError(null)

    try {
      // await loginMutation.mutateAsync(data)
      await authClient.signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: '/dashboard',
        rememberMe: false,
      })
    } catch (error: any) {
      if (isAxiosError(error)) {
        const message = error.response?.data.message || 'Login failed'
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
    isLoading: loginMutation.isPending || isSubmitting,
  }
}
