import RowError from '@/components/Table/RowError'
import useOtpForm from './useOtpForm'
import FormLabel from '@/components/Form/FormLabel'

export default function FormOtp({ initialEmail }: { initialEmail?: string }) {
  const {
    apiError,
    errors,
    isLoading,
    isResending,
    onResend,
    onSubmit,
    register,
  } = useOtpForm({ initialEmail })

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

          <div className="space-y-1.5">
            <FormLabel title="Email Address" />
            <input
              {...register('email')}
              placeholder="Email"
              className="input w-full"
            />
            <RowError message={errors.email?.message} />
          </div>

          <div className="space-y-1.5">
            <FormLabel title="One-Time Password (OTP)" />
            <input
              type="text"
              {...register('otp_code')}
              placeholder="000000"
              className="input w-full"
            />
            <RowError message={errors.otp_code?.message} />
          </div>

          <div className="pt-2 space-y-3">
            <button disabled={isLoading} className="btn btn-block btn-neutral">
              {isLoading ? 'Verifying...' : 'Verify Identity'}
            </button>

            <button
              type="button"
              disabled={isResending}
              className="link link-hover link-neutral text-sm text-slate-600 btn-block"
              onClick={onResend}
            >
              {isResending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                  Sending new code...
                </span>
              ) : (
                "Didn't receive a code? Resend"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
