import { useState } from 'react'
import { isAxiosError } from 'axios'
import type React from 'react'
import type { ActivateAccountPayload } from '~/models/user/credentials'
import type { ParsedError } from '~/models/system'
import { useActiveAccount, useVerifyOtp } from '~/api/auth'
import { parseError } from '~/utils/errors'

export default function useActivate() {
  const [errors, setErrors] = useState<ParsedError | null>(null)
  const [verifyErrors, setVerifyErrors] = useState<ParsedError | null>(null)
  const [form, setForm] = useState<ActivateAccountPayload>({
    name: '',
    email: '',
    otp_code: '',
    password: '',
    password_confirmation: '',
    diagnosis_id: undefined,
  })
  const [accountRole, setAccountRole] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleOtpChange = (digits: Array<string>) => {
    setForm((prev) => ({ ...prev, otp_code: digits.join('') }))
  }

  const verify = useVerifyOtp()
  const register = useActiveAccount()

  async function handleVerify(): Promise<boolean> {
    setVerifyErrors(null)
    try {
      const response = await verify.mutateAsync({
        email: form.email,
        otp_code: form.otp_code,
      })
      setAccountRole(response.account_role || null)
      return true
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        setVerifyErrors(parseError(error.response?.data))
      }
      return false
    }
  }

  async function handleSubmit() {
    setErrors(null)
    try {
      await register.mutateAsync(form)
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
    verifyErrors,
    isLoading: register.isPending,
    isVerifying: verify.isPending,
    accountRole,
    handleChange,
    handleOtpChange,
    handleVerify,
    handleSubmit,
  }
}
