import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import useActivate from './useActivate'

import OtpForm from './activate/OtpForm'
import ProfileForm from './activate/ProfileForm'

import type { RegisterActivateStep, RegisterDiagnosis } from '~/models/public'

export default function RegisterActivate(props: RegisterDiagnosis) {
  const { data } = props

  const [step, setStep] = useState<RegisterActivateStep>('verify')
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
  const { email, otp_code } = form

  const canContinue = email.trim() !== '' && otp_code.length === 6

  async function onContinue() {
    const ok = await handleVerify()
    if (ok) setStep('form')
  }

  return (
    <div className="container flex flex-col items-center gap-4 mx-auto">
      {step === 'verify' ? (
        <>
          <OtpForm
            email={email}
            otpCode={otp_code}
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
        <ProfileForm
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
