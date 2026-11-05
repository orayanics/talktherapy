import useRegisterForm from '#/modules/register/hooks/useRegisterForm'
import { useQuery } from '@tanstack/react-query'
import { fetchDiagnoses } from '#/modules/diagnoses/api/diagnoses'
import type { DiagnosisItem } from '#/modules/diagnoses/types/diagnosis'
import { Link } from '@tanstack/react-router'
import FormInput from '#/components/Form/FormInput'
import RowError from '#/components/Table/RowError'
import StateLoading from '#/components/State/StateLoading'
import StateError from '#/components/State/StateError'

export default function RegisterForm() {
  const { register, onSubmit, errors, apiError, isLoading } = useRegisterForm()
  const { data: diagnoses, isPending, isError } = useQuery(fetchDiagnoses)

  if (isPending) return <StateLoading />
  if (isError) return <StateError />

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
          <p className="text-slate-800 font-medium">Welcome back!</p>
          <p className="text-slate-500 text-sm">Ready to join the session?</p>
        </div>

        {apiError && (
          <div className="alert alert-soft alert-error" role="alert">
            {apiError}
          </div>
        )}

        <FormInput label="Name" error={errors.name?.message} required>
          <input
            id="register-name"
            {...register('name')}
            placeholder="Name"
            className="input w-full"
          />
        </FormInput>

        <FormInput label="Email" error={errors.email?.message} required>
          <input
            id="register-email"
            {...register('email')}
            placeholder="Email"
            type="email"
            className="input w-full"
          />
        </FormInput>

        <FormInput
          label="Diagnosis Group"
          error={errors.diagnosis_id?.message}
          required
        >
          <select
            id="register-diagnosis"
            className="select w-full"
            {...register('diagnosis_id')}
          >
            <option value="" disabled>
              Select Diagnosis
            </option>
            {diagnoses.map((item: DiagnosisItem) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </FormInput>

        <FormInput label="Password" error={errors.password?.message} required>
          <input
            id="register-password"
            {...register('password')}
            placeholder="Password"
            className="input w-full"
            type="password"
          />
        </FormInput>

        <FormInput
          label="Confirm Password"
          error={errors.password_confirmation?.message}
          required
        >
          <input
            id="register-password-confirmation"
            {...register('password_confirmation')}
            placeholder="Confirm Password"
            className="input w-full"
            type="password"
          />
        </FormInput>

        <div className="flex gap-2">
          <input
            id="register-consent"
            {...register('consent')}
            className="checkbox bg-white"
            type="checkbox"
          />
          <label htmlFor="register-consent" className="label">
            I consent to the terms and conditions
          </label>
        </div>
        <RowError message={errors.consent?.message} />

        <div className="flex flex-col gap-4 items-center">
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-neutral btn-block"
          >
            Register
          </button>

          <Link
            to="/login"
            className="link link-hover link-neutral text-sm text-center"
          >
            Alreay have an account? Login
          </Link>
        </div>
      </div>
    </form>
  )
}
