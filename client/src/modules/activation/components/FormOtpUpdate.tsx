import useOtpUpdateForm from '#/modules/activation/hooks/useOtpUpdateForm'
import { useQuery } from '@tanstack/react-query'
import { fetchDiagnoses } from '#/modules/diagnoses/api/diagnoses'
import type { DiagnosisItem } from '#/modules/diagnoses/types/diagnosis'
import { Navigate } from '@tanstack/react-router'
import StateError from '#/components/State/StateError'
import StateLoading from '#/components/State/StateLoading'
import FormInput from '#/components/Form/FormInput'

export default function FormOtpUpdate({
  otp,
  role,
  initialEmail,
  requiresCredentials,
}: {
  otp: string
  role?: string
  initialEmail?: string
  requiresCredentials?: boolean
}) {
  const {
    apiError,
    errors,
    isPatient,
    isLoading,
    isResending,
    onResend,
    onSubmit,
    register,
  } = useOtpUpdateForm({ otp, initialEmail, role, requiresCredentials })

  const { data: diagnoses, isPending, isError } = useQuery(fetchDiagnoses)

  const shouldShowDiagnosis = role === 'clinician' || requiresCredentials

  if (isPending || isError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-full max-w-120">
          {isPending ? <StateLoading /> : <StateError />}
        </div>
      </div>
    )
  }

  if (isPatient) return <Navigate to="/activate/otp" replace />

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-120 bg-white border border-slate-200 rounded-box shadow-lg shadow-slate-300 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Account Details
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Complete your profile to finalize registration.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {apiError && (
            <div className="alert alert-soft alert-error" role="alert">
              {apiError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-2">
            <FormInput label="Full Name" error={errors.name?.message} required>
              <input
                id="activation-name"
                {...register('name')}
                placeholder="Dr. Jane Doe"
                className="input w-full"
              />
            </FormInput>

            <FormInput
              label="Email Address"
              error={errors.email?.message}
              required
            >
              <input
                id="activation-email"
                {...register('email')}
                placeholder="name@clinic.com"
                className="input w-full"
                readOnly
              />
            </FormInput>
          </div>

          {shouldShowDiagnosis && (
            <FormInput
              label="Diagnosis Group"
              error={errors.diagnosis_id?.message}
              required
            >
              <select
                id="activation-diagnosis"
                className="select w-full"
                {...register('diagnosis_id')}
              >
                <option value="" disabled>
                  Select Specialization
                </option>
                {diagnoses.map((item: DiagnosisItem) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </FormInput>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Password"
              error={errors.password?.message}
              required
            >
              <input
                id="activation-password"
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="input w-full"
              />
            </FormInput>

            <FormInput
              label="Confirm Password"
              error={errors.password_confirmation?.message}
              required
            >
              <input
                id="activation-password-confirmation"
                type="password"
                {...register('password_confirmation')}
                placeholder="••••••••"
                className="input w-full"
              />
            </FormInput>
          </div>

          <div className="pt-4 space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-block btn-neutral"
            >
              {isLoading ? 'Updating Account...' : 'Complete Activation'}
            </button>

            <button
              type="button"
              disabled={isResending}
              className="link link-hover link-neutral text-sm text-slate-600 btn-block"
              onClick={onResend}
            >
              {isResending
                ? 'Resending verification...'
                : 'Resend Verification Code'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
