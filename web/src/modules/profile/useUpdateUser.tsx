import { useState } from 'react'
import { isAxiosError } from 'axios'
import type React from 'react'

import type { UpdateUserPayload } from '~/models/payloads'

import type { ParsedError } from '~/models/system'
import { useEditProfile } from '~/api/auth'
import { parseError } from '~/utils/errors'

export default function useUpdateUser({ user_name }: { user_name: string }) {
  const [errors, setErrors] = useState<ParsedError | null>(null)
  const [form, setForm] = useState<UpdateUserPayload>({
    name: user_name,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors(null)
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const updateUserMutation = useEditProfile()

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
