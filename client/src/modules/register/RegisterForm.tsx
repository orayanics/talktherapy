import useRegisterForm from './useRegisterForm'
import { useQuery } from '@tanstack/react-query'
import { fetchDiagnoses } from '@/api/public'
import type { DiagnosisItem } from '@/api/public'
import RowError from '@/components/Table/RowError'
import { Link } from '@tanstack/react-router'

export default function RegisterForm() {
  const { register, onSubmit, errors, apiError, isLoading } = useRegisterForm()
  const { data: diagnoses, isPending, isError } = useQuery(fetchDiagnoses)

  if (isPending) return <div>Loading...</div>
  if (isError) return <div>Error loading diagnoses</div>

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md lg:max-w-xl mx-auto">
      <div className="p-6 h-full space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-white">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-slate-800 text-3xl font-bold">TalkTherapy</h1>
        </div>

        <div>
          <p className="text-slate-800">Welcome back!</p>
          <p className="text-slate-500">Ready to join the session?</p>
        </div>

        {apiError && (
          <div className="alert alert-soft alert-error">{apiError}</div>
        )}

        <div className="flex flex-col">
          <label className="label">Name</label>
          <input
            {...register('name')}
            placeholder="Name"
            className="input w-full"
          />
          <RowError message={errors.name?.message} />
        </div>

        <div className="flex flex-col">
          <label className="label">Email</label>
          <input
            {...register('email')}
            placeholder="Email"
            type="email"
            className="input w-full"
          />
          <RowError message={errors.email?.message} />
        </div>

        <div className="flex flex-col">
          <label className="label">Diagnosis</label>
          <select className="select w-full" {...register('diagnosis_id')}>
            <option value="">Select Diagnosis</option>
            {diagnoses.map((item: DiagnosisItem) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <RowError message={errors.diagnosis_id?.message} />
        </div>

        <div className="flex flex-col">
          <label className="label">Password</label>
          <input
            {...register('password')}
            placeholder="Password"
            className="input w-full"
            type="password"
          />
          <RowError message={errors.password?.message} />
        </div>

        <div className="flex flex-col">
          <label className="label">Confirm Password</label>
          <input
            {...register('password_confirmation')}
            placeholder="Confirm Password"
            className="input w-full"
            type="password"
          />
          <RowError message={errors.password_confirmation?.message} />
        </div>

        <div className="flex gap-2">
          <input
            {...register('consent')}
            className="checkbox bg-white"
            type="checkbox"
          />
          <label className="label">I consent to the terms and conditions</label>
        </div>
        <RowError message={errors.consent?.message} />

        <div className="flex flex-col gap-4 items-center">
          <button disabled={isLoading} className="btn btn-neutral btn-block">
            Register
          </button>

          <Link to="/login" className="link link-hover">
            Alreay have an account? Login
          </Link>
        </div>
      </div>
    </form>
  )
}
