import { useState } from 'react'
import { isAxiosError } from 'axios'
import type React from 'react'

import type { UpdatePasswordPayload } from '~/models/payloads'

import type { ParsedError } from '~/models/system'
import { useEditPassword } from '~/api/auth'
import { parseError } from '~/utils/errors'

export default function useUpdatePassword() {
  const [errors, setErrors] = useState<ParsedError | null>(null)
  const [form, setForm] = useState<UpdatePasswordPayload>({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors(null)
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const updateUserMutation = useEditPassword()

  async function handleSubmit() {
    setErrors(null)
    try {
      await updateUserMutation.mutateAsync(form)
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response) {
        setErrors(parseError(error.response.data))
      } else {
        setErrors(null)
      }
    }
  }

  return {
    form,
    errors,
    handleChange,
    handleSubmit,
    isLoading: updateUserMutation.isPending,
  }
}
