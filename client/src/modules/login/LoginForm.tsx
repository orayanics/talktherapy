import RowError from '@/components/Table/RowError'
import useLoginForm from './useLoginForm'
import { Link } from '@tanstack/react-router'

export default function LoginForm() {
  const { register, onSubmit, errors, apiError, isLoading } = useLoginForm()
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
          <p className="text-slate-500">
            Ready to continue where you left off?
          </p>
        </div>

        {apiError && (
          <div className="alert alert-soft alert-error">{apiError}</div>
        )}

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
          <label className="label">Password</label>
          <input
            {...register('password')}
            placeholder="Password"
            className="input w-full"
            type="password"
          />
          <RowError message={errors.password?.message} />
        </div>

        <div className="flex flex-col gap-4 items-center">
          <button disabled={isLoading} className="btn btn-neutral btn-block">
            Login
          </button>

          <Link to="/register" className="link link-hover">
            No account yet? Register
          </Link>

          <Link to="/activate/otp" className="link link-hover">
            Activate Account
          </Link>
        </div>
      </div>
    </form>
  )
}
