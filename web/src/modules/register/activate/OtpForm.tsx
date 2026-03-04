import { useRef } from 'react'
import type { RegisterOtpForm } from '~/models/public'
import { hasOnlyMessage } from '~/utils/errors'

export default function OtpForm(props: RegisterOtpForm) {
  const { email, otpCode, onEmailChange, onOtpChange, errors } = props
  const digitRefs = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null))
  const digits = Array.from({ length: 6 }, (_, i) => otpCode[i] ?? '')

  function handleDigitChange(
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const ch = e.target.value.replace(/\D/g, '').slice(-1)
    const next = digits.map((d, i) => (i === index ? ch : d))
    onOtpChange(next)
    if (ch && index < 5) digitRefs.current[index + 1]?.focus()
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <h1 className="font-semibold">Account Activation</h1>
      <p>
        Enter your email and the 6-digit verification code sent to it to
        continue to account setup.
      </p>
      {hasOnlyMessage(errors) && (
        <p className="text-error text-sm mt-1">{errors!.message}</p>
      )}
      <div>
        <input
          className="input w-full"
          type="email"
          name="email"
          placeholder="Email address"
          value={email}
          onChange={onEmailChange}
        />
      </div>
      <div className="flex flex-row justify-center gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              digitRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="input w-full h-11 text-center text-md lg:text-xl"
          />
        ))}
      </div>
    </div>
  )
}
