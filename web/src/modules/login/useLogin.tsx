import { useState } from 'react'
import { isAxiosError } from 'axios'

import type { LoginPayload } from '~/models/payloads'
import type { ParsedError } from '~/models/system'

import { useLogin as useLoginApi } from '~/api/auth'
import { parseError } from '~/utils/errors'

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
