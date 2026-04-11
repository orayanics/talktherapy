import { z } from 'zod'

export const ActivateAccountSchema = z
  .object({
    name: z.string().max(255),
    email: z.email(),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[@$!%*?&]/,
        'Password must contain at least one special character',
      ),
    password_confirmation: z.string(),
    otp_code: z.string().length(6),
    diagnosis_id: z.string().optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
  })

export const VerifyOtpSchema = z.object({
  email: z.email(),
  otp_code: z.string().length(6),
})

export type TVerifyOtp = z.infer<typeof VerifyOtpSchema>
export type TActivateAccount = z.infer<typeof ActivateAccountSchema>
