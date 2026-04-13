import { z } from 'zod'

const emptyToUndefined = (value: unknown) => {
  if (typeof value === 'string' && value.trim() === '') return undefined
  return value
}

export const ActivateAccountSchema = z
  .object({
    name: z.preprocess(emptyToUndefined, z.string().max(255).optional()),
    email: z.email(),
    password: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .min(8)
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(
          /[@$!%*?&]/,
          'Password must contain at least one special character',
        )
        .optional(),
    ),
    password_confirmation: z.preprocess(
      emptyToUndefined,
      z.string().optional(),
    ),
    otp_code: z.string().length(6),
    diagnosis_id: z.preprocess(emptyToUndefined, z.string().optional()),
  })
  .refine(
    (data) => {
      if (!data.password && !data.password_confirmation) return true
      return data.password === data.password_confirmation
    },
    {
      message: 'Passwords do not match',
    },
  )

export const VerifyOtpSchema = z.object({
  email: z.email(),
  otp_code: z.string().length(6),
})

export const ResendOtpSchema = z.object({
  email: z.email(),
})

export type TVerifyOtp = z.infer<typeof VerifyOtpSchema>
export type TResendOtp = z.infer<typeof ResendOtpSchema>
export type TActivateAccount = z.infer<typeof ActivateAccountSchema>
