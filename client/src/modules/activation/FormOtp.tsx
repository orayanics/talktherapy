import useOtpForm from './useOtpForm'

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
    <form onSubmit={onSubmit} className="card">
      <div className="card-body">
        {apiError && (
          <div className="alert alert-soft alert-error">{apiError}</div>
        )}

        <input {...register('email')} placeholder="Email" className="input" />
        {errors.email && <p>{errors.email.message}</p>}

        <input
          type="text"
          {...register('otp_code')}
          placeholder="OTP Code"
          className="input"
        />
        {errors.otp_code && <p>{errors.otp_code.message}</p>}

        <button disabled={isLoading} className="btn">
          Verify
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
