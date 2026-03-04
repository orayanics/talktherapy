import { useState } from 'react'
import { isAxiosError } from 'axios'

import type { ChangeEvent } from 'react'
import type { PermissionKey } from '~/models/permissions'
import type { ParsedError } from '~/models/system'
import { useAddAdmin, useAddClinician } from '~/api/users'
import { parseError } from '~/utils/errors'

export function useRegisterClinician() {
  const [errors, setErrors] = useState<ParsedError | null>(null)
  const initialForm = {
    email: '',
  }
  const [form, setForm] = useState(initialForm)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const addClinicianMutation = useAddClinician()

  async function handleSubmit() {
    setErrors(null)
    try {
      await addClinicianMutation.mutateAsync(form)
      return true
    } catch (error: unknown) {
      setErrors(
        isAxiosError(error) ? parseError(error.response?.data ?? null) : null,
      )
      return false
    } finally {
      setForm(initialForm)
    }
  }

  const resetState = () => {
    setErrors(null)
    setForm(initialForm)
  }

  return {
    form,
    errors,
    isLoading: addClinicianMutation.isPending,
    handleChange,
    handleSubmit,
    resetState,
  }
}

export function useRegisterAdmin() {
  const [errors, setErrors] = useState<ParsedError | null>(null)
  const initialForm = {
    email: '',
    abilities: [] as Array<PermissionKey>,
  }
  const [form, setForm] = useState(initialForm)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePermissionChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target
    setForm((prev) => ({
      ...prev,
      abilities: checked
        ? [...prev.abilities, value as PermissionKey]
        : prev.abilities.filter((p) => p !== value),
    }))
  }

  const addAdminMutation = useAddAdmin()

  async function handleSubmit() {
    setErrors(null)
    try {
      await addAdminMutation.mutateAsync(form)
      return true
    } catch (error: unknown) {
      setErrors(
        isAxiosError(error) ? parseError(error.response?.data ?? null) : null,
      )
      return false
    } finally {
      setForm(initialForm)
    }
  }

  const resetState = () => {
    setErrors(null)
    setForm(initialForm)
  }

  return {
    form,
    errors,
    isLoading: addAdminMutation.isPending,
    handleChange,
    handlePermissionChange,
    handleSubmit,
    resetState,
  }
}
