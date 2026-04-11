import useOtpUpdateForm from './useOtpUpdateForm'
import { useQuery } from '@tanstack/react-query'
import { fetchDiagnoses } from '@/api/public'
import type { DiagnosisItem } from '@/api/public'

export default function FormOtpUpdate({
  otp,
  role,
}: {
  otp: string
  role?: string
}) {
  const { apiError, errors, isLoading, onSubmit, register } = useOtpUpdateForm({
    otp,
  })
  const { data: diagnoses, isPending, isError } = useQuery(fetchDiagnoses)
  const isHide = role === 'ADMIN' || role === undefined

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

        {!isHide && (
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
      </div>
    </form>
  )
}
