import React, { useState } from 'react'
import { LoginPayload } from '~/models/user/credentials'
import { useLogin as useLoginApi } from '~/api/auth'
import { isAxiosError } from 'axios'
import { ParsedError, parseError } from '~/utils/errors'

export default function useLogin() {
  const [errors, setErrors] = useState<ParsedError | null>(null)
  const [form, setForm] = useState<LoginPayload>({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const loginMutation = useLoginApi()
  async function handleSubmit() {
    setErrors(null)
    try {
      await loginMutation.mutateAsync(form)
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        setErrors(parseError(error.response?.data))
      } else {
        setErrors(null)
      }
    }
  }

  return {
    form,
    errors,
    isLoading: loginMutation.isPending,
    handleChange,
    handleSubmit,
  }
}
