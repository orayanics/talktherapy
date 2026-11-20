import useLoginForm from '#/modules/login/hooks/useLoginForm'
import { Link } from '@tanstack/react-router'
import FormInput from '#/components/Form/FormInput'

export default function LoginForm() {
  const { register, onSubmit, errors, apiError, isLoading } = useLoginForm()
  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="space-y-4">
        {apiError && (
          <div className="alert alert-soft alert-error" role="alert">
            {apiError}
          </div>
        )}

        <FormInput
          htmlFor="login-email"
          label="Email"
          error={errors.email?.message}
          errorId="login-email-error"
          required
        >
          <input
            id="login-email"
            {...register('email')}
            placeholder="Email"
            type="email"
            className="input w-full"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
          />
        </FormInput>

        <FormInput
          htmlFor="login-password"
          label="Password"
          error={errors.password?.message}
          errorId="login-password-error"
          required
        >
          <input
            id="login-password"
            {...register('password')}
            placeholder="Password"
            className="input w-full"
            type="password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? 'login-password-error' : undefined
            }
          />
        </FormInput>

        <div className="flex flex-col gap-4 items-center">
          <button disabled={isLoading} className="btn btn-primary btn-block">
            Login
          </button>

          <Link
            to="/register"
            className="link link-hover link-neutral text-sm text-center"
          >
            No account yet? Register
          </Link>

          <Link
            to="/activate/otp"
            className="link link-hover text-sm  text-center"
          >
            Activate Account
          </Link>
        </div>
      </div>
    </form>
  )
}
