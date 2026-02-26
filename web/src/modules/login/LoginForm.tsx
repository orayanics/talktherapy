import { Link } from '@tanstack/react-router'
import { FaEnvelope, FaLock } from 'react-icons/fa'
import useLogin from './useLogin'
import { fieldError, hasOnlyMessage } from '~/utils/errors'

export default function LoginForm() {
  const { form, errors, isLoading, handleChange, handleSubmit } = useLogin()
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <div className="flex flex-col gap-4">
        {hasOnlyMessage(errors) && (
          <p className="text-error text-center text-sm mt-1">
            {errors!.message}
          </p>
        )}
        <div>
          <label className="input w-full">
            <FaEnvelope />
            <input
              type="email"
              placeholder="email@email.com"
              value={form.email}
              name="email"
              onChange={handleChange}
              autoComplete="email"
            />
          </label>
          {fieldError(errors, 'email') && (
            <p className="text-error text-sm mt-1">
              {fieldError(errors, 'email')}
            </p>
          )}
        </div>

        <div>
          <label className="input w-full">
            <FaLock />
            <input
              type="password"
              placeholder="********"
              value={form.password}
              name="password"
              onChange={handleChange}
              autoComplete="current-password"
            />
          </label>
          {fieldError(errors, 'password') && (
            <p className="text-error text-sm mt-1">
              {fieldError(errors, 'password')}
            </p>
          )}
        </div>
        <div className="flex flex-col items-center gap-2 ">
          <button
            className="btn btn-primary w-full mt-4"
            type="submit"
            disabled={isLoading}
          >
            Login
          </button>
          <Link to="/register">
            Don't have an account?{' '}
            <span className="link link-hover">Register here!</span>
          </Link>
        </div>
      </div>
    </form>
  )
}
