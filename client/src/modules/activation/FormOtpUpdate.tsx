import useOtpUpdateForm from './useOtpUpdateForm'
import { useQuery } from '@tanstack/react-query'
import { fetchDiagnoses } from '@/api/public'
import type { DiagnosisItem } from '@/api/public'

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
    isLoading,
    isResending,
    onResend,
    onSubmit,
    register,
  } = useOtpUpdateForm({ otp, initialEmail })
  const { data: diagnoses, isPending, isError } = useQuery(fetchDiagnoses)
  const shouldShowDiagnosis = role === 'CLINICIAN'

  if (isPending) return <div>Loading...</div>
  if (isError) return <div>Error loading diagnoses</div>

  return (
    <form onSubmit={onSubmit} className="card">
      <div className="card-body">
        {apiError && (
          <div className="alert alert-soft alert-error">{apiError}</div>
        )}

        <input {...register('name')} placeholder="Name" className="input" />
        {errors.name && <p>{errors.name.message}</p>}

        <input {...register('email')} placeholder="Email" className="input" />
        {errors.email && <p>{errors.email.message}</p>}

        {shouldShowDiagnosis && (
          <select className="select" {...register('diagnosis_id')}>
            <option value="">Select Diagnosis</option>
            {diagnoses.map((item: DiagnosisItem) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        )}

        <input
          type="password"
          {...register('password')}
          placeholder="Password"
          className="input"
        />
        {errors.password && <p>{errors.password.message}</p>}

        <input
          type="password"
          {...register('password_confirmation')}
          placeholder="Confirm Password"
          className="input"
        />
        {errors.password_confirmation && (
          <p>{errors.password_confirmation.message}</p>
        )}

        <button disabled={isLoading} className="btn">
          Update Account
        </button>

        <button
          type="button"
          disabled={isResending}
          className="btn btn-ghost"
          onClick={onResend}
        >
          {isResending ? 'Resending...' : 'Resend OTP'}
        </button>
      </div>
    </form>
  )
}
