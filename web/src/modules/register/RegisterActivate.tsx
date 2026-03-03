import { useRef, useState } from 'react'
import { Link, useBlocker } from '@tanstack/react-router'
import useActivate from './useActivate'
import type React from 'react'
import type { ParsedError, ResponseData } from '~/models/system'
import type { ActivateAccountPayload } from '~/models/user/credentials'
import ModalBlockNavigation from '~/components/Modal/ModalBlockNavigation'
import { fieldError, hasOnlyMessage } from '~/utils/errors'

type Step = 'verify' | 'form'

export default function RegisterActivate({ data }: ResponseData) {
  const [step, setStep] = useState<Step>('verify')
  const {
    form,
    errors,
    verifyErrors,
    isLoading,
    isVerifying,
    accountRole,
    handleChange,
    handleOtpChange,
    handleVerify,
    handleSubmit,
  } = useActivate()

  const canContinue = form.email.trim() !== '' && form.otp_code.length === 6

  async function onContinue() {
    const ok = await handleVerify()
    if (ok) setStep('form')
  }

  return (
    <div className="container flex flex-col items-center gap-4 mx-auto">
      {step === 'verify' ? (
        <>
          <AccountVerification
            email={form.email}
            otpCode={form.otp_code}
            onEmailChange={handleChange}
            onOtpChange={handleOtpChange}
            errors={verifyErrors}
          />
          <button
            className="btn btn-primary w-full mt-4"
            onClick={onContinue}
            disabled={!canContinue || isVerifying}
          >
            {isVerifying ? 'Verifying...' : 'Continue'}
          </button>
        </>
      ) : (
        <ActivationForm
          form={form}
          data={data}
          errors={errors}
          isLoading={isLoading}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onBack={() => setStep('verify')}
          accountRole={accountRole}
        />
      )}
      <Link to="/login">
        I already have an account.{' '}
        <span className="link link-hover">Login here.</span>
      </Link>
    </div>
  )
}

function AccountVerification({
  email,
  otpCode,
  onEmailChange,
  onOtpChange,
  errors,
}: {
  email: string
  otpCode: string
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onOtpChange: (digits: Array<string>) => void
  errors: ParsedError | null
}) {
  const digitRefs = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null))
  const digits = Array.from({ length: 6 }, (_, i) => otpCode[i] ?? '')

  function handleDigitChange(
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const ch = e.target.value.replace(/\D/g, '').slice(-1)
    const next = digits.map((d, i) => (i === index ? ch : d))
    onOtpChange(next)
    if (ch && index < 5) digitRefs.current[index + 1]?.focus()
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <h1 className="font-semibold">Account Activation</h1>
      <p>
        Enter your email and the 6-digit verification code sent to it to
        continue to account setup.
      </p>
      {hasOnlyMessage(errors) && (
        <p className="text-error text-sm mt-1">{errors!.message}</p>
      )}
      <div>
        <input
          className="input w-full"
          type="email"
          name="email"
          placeholder="Email address"
          value={email}
          onChange={onEmailChange}
        />
      </div>
      <div className="flex flex-row justify-center gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              digitRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="input w-full h-11 text-center text-md lg:text-xl"
          />
        ))}
      </div>
    </div>
  )
}

function ActivationForm({
  form,
  data,
  errors,
  isLoading,
  accountRole,
  onChange,
  onSubmit,
  onBack,
}: {
  form: Pick<
    ActivateAccountPayload,
    'name' | 'email' | 'password' | 'password_confirmation' | 'diagnosis_id'
  >
  data: Array<any>
  errors: ParsedError | null
  isLoading: boolean
  accountRole: string | null
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  onSubmit: () => void
  onBack: () => void
}) {
  const [formIsDirty, setFormIsDirty] = useState(false)

  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: () => formIsDirty,
    enableBeforeUnload: formIsDirty,
    withResolver: true,
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    if (!formIsDirty) setFormIsDirty(true)
    onChange(e)
  }

  return (
    <div className="mx-auto w-full">
      {status === 'blocked' && (
        <ModalBlockNavigation isOpen onProceed={proceed} onReset={reset}>
          <p className="text-gray-700 mb-6">
            You have unsaved changes. Are you sure you want to leave this page?
          </p>
        </ModalBlockNavigation>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
        className="flex flex-col gap-1 lg:gap-4"
      >
        <div className="flex flex-col gap-1 lg:gap-4">
          <h1 className="font-semibold">Personal Information</h1>
          <div>
            <input
              className="input w-full"
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleInputChange}
            />
            {fieldError(errors, 'name') && (
              <span className="mt-2 text-sm text-error">
                {fieldError(errors, 'name')}
              </span>
            )}
          </div>
          {accountRole === 'clinician' && (
            <div>
              <select
                className="select w-full"
                name="diagnosis_id"
                value={form.diagnosis_id ?? ''}
                onChange={handleInputChange}
              >
                <option value="">Select Diagnosis</option>
                {data.map((diagnosis: any) => (
                  <option key={diagnosis.id} value={diagnosis.id}>
                    {diagnosis.label}
                  </option>
                ))}
              </select>
              {fieldError(errors, 'diagnosis_id') && (
                <span className="mt-2 text-sm text-error">
                  {fieldError(errors, 'diagnosis_id')}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 lg:gap-4">
          <h1 className="font-semibold">Account</h1>
          <div className="flex flex-col gap-4">
            <input
              className="input w-full"
              type="email"
              value={form.email}
              placeholder="Email"
              readOnly
              disabled
            />
            <div>
              <input
                className="input w-full"
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleInputChange}
              />
              {fieldError(errors, 'password') && (
                <span className="mt-2 text-sm text-error">
                  {fieldError(errors, 'password')}
                </span>
              )}
            </div>
            <div>
              <input
                className="input w-full"
                type="password"
                name="password_confirmation"
                placeholder="Confirm Password"
                value={form.password_confirmation}
                onChange={handleInputChange}
              />
              {fieldError(errors, 'password_confirmation') && (
                <span className="mt-2 text-sm text-error">
                  {fieldError(errors, 'password_confirmation')}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            className="btn btn-ghost flex-1"
            onClick={onBack}
            disabled={isLoading}
          >
            Back
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-1"
            disabled={isLoading}
          >
            {isLoading ? 'Activating...' : 'Activate Account'}
          </button>
        </div>
      </form>
    </div>
  )
}
