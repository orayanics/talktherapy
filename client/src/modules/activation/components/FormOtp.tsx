import useOtpForm from '#/modules/activation/hooks/useOtpForm'
import FormInput from '#/components/Form/FormInput'

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
    <>
      <form onSubmit={onSubmit} className="w-full">
        <div className="space-y-5">
          {apiError && (
            <div className="alert alert-soft alert-error" role="alert">
              {apiError}
            </div>
          )}

          <FormInput
            htmlFor="activation-email"
            label="Email Address"
            error={errors.email?.message}
            errorId="activation-email-error"
            required
          >
            <input
              id="activation-email"
              {...register('email')}
              placeholder="Email"
              className="input w-full"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? 'activation-email-error' : undefined
              }
            />
          </FormInput>

          <FormInput
            htmlFor="activation-otp"
            label="One-Time Password (OTP)"
            error={errors.otp_code?.message}
            errorId="activation-otp-error"
            required
          >
            <input
              id="activation-otp"
              type="text"
              {...register('otp_code')}
              placeholder="000000"
              className="input w-full"
              aria-invalid={Boolean(errors.otp_code)}
              aria-describedby={
                errors.otp_code ? 'activation-otp-error' : undefined
              }
            />
          </FormInput>

          <div className="pt-2 space-y-3">
            <button disabled={isLoading} className="btn btn-block btn-primary">
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
    </>
  )
}
