import useOtpForm from './useOtpForm'

export default function FormOtp() {
  const { apiError, errors, isLoading, onSubmit, register } = useOtpForm()
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
      </div>
    </form>
  )
}
