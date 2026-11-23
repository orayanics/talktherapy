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
    <form onSubmit={onSubmit} className="w-full">
      <div className="space-y-4">
        {apiError && (
          <div className="alert alert-soft alert-error" role="alert">
            {apiError}
          </div>
        )}

        <FormInput
          htmlFor="register-name"
          label="Name"
          error={errors.name?.message}
          required
        >
          <input
            id="register-name"
            {...register('name')}
            placeholder="Name"
            className="input w-full"
          />
        </FormInput>

        <FormInput
          htmlFor="register-email"
          label="Email"
          error={errors.email?.message}
          required
        >
          <input
            id="register-email"
            {...register('email')}
            placeholder="Email"
            type="email"
            className="input w-full"
          />
        </FormInput>

        <FormInput
          htmlFor="register-diagnosis"
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

        <FormInput
          htmlFor="register-password"
          label="Password"
          error={errors.password?.message}
          required
        >
          <input
            id="register-password"
            {...register('password')}
            placeholder="Password"
            className="input w-full"
            type="password"
          />
        </FormInput>

        <FormInput
          htmlFor="register-password-confirmation"
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
        <label className="flex items-start gap-2">
          <input type="checkbox" className="checkbox bg-white" {...register('privacy_v1')} />
          I agree that TalkTherapy may store my account details and health information to provide care. My assigned clinician can review the exercises I submit.
        </label>
        <RowError message={errors.privacy_v1?.message} />

        <div className="flex flex-col gap-4 items-center">
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary btn-block"
          >
            Register
          </button>

          <Link
            to="/login"
            className="link link-hover link-neutral text-sm text-center"
          >
            Already have an account? Log in
          </Link>
        </div>
      </div>
    </form>
  )
}
