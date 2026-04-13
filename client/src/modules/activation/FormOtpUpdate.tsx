import useOtpUpdateForm from './useOtpUpdateForm'
import { useQuery } from '@tanstack/react-query'
import { fetchDiagnoses } from '@/api/public'
import type { DiagnosisItem } from '@/api/public'
import { Navigate } from '@tanstack/react-router'
import StateError from '@/components/State/StateError'
import StateLoading from '@/components/State/StateLoading'
import RowError from '@/components/Table/RowError'
import FormLabel from '@/components/Form/FormLabel'

export default function FormOtpUpdate({
  otp,
  role,
  initialEmail,
}: {
  otp: string
  role?: string
  initialEmail?: string
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
  } = useOtpUpdateForm({ otp, initialEmail, role })

  const { data: diagnoses, isPending, isError } = useQuery(fetchDiagnoses)

  const shouldShowDiagnosis = role === 'CLINICIAN'

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
        className="w-full max-w-120 bg-white border border-slate-200 rounded-lg shadow-lg shadow-slate-300 overflow-hidden"
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
            <div className="alert alert-soft alert-error">{apiError}</div>
          )}

          <div className="grid grid-cols-1 gap-2">
            <div>
              <FormLabel title="Full Name" />
              <input
                {...register('name')}
                placeholder="Dr. Jane Doe"
                className="input w-full"
              />
              <RowError message={errors.name?.message} />
            </div>

            <div className="space-y-1.5">
              <FormLabel title="Email Address" />
              <input
                {...register('email')}
                placeholder="name@clinic.com"
                className="input w-full"
                readOnly
              />
              <RowError message={errors.email?.message} />
            </div>
          </div>

          {shouldShowDiagnosis && (
            <div>
              <FormLabel title="Diagnosis Group" />
              <select className="select w-full" {...register('diagnosis_id')}>
                <option value="">Select Specialization</option>
                {diagnoses.map((item: DiagnosisItem) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
              <RowError message={errors.diagnosis_id?.message} />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormLabel title="Password" />
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="input w-full"
              />
              <RowError message={errors.password?.message} />
            </div>

            <div>
              <FormLabel title="Confirm Password" />
              <input
                type="password"
                {...register('password_confirmation')}
                placeholder="••••••••"
                className="input w-full"
              />
            </div>
          </div>
          <RowError message={errors.password_confirmation?.message} />

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
