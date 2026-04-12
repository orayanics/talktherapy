import { z } from 'zod'

export const ProfileSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email').or(z.literal('')),
    currentPassword: z.string().or(z.literal('')),
    newPassword: z.string().or(z.literal('')),
    confirmPassword: z.string().or(z.literal('')),
  })
  .refine(
    (data) => {
      const { currentPassword, newPassword, confirmPassword } = data
      const anyFilled = currentPassword || newPassword || confirmPassword
      if (!anyFilled) return true
      return !!(currentPassword && newPassword && confirmPassword)
    },
    {
      message: 'All password fields are required to change password',
      path: ['currentPassword'],
    },
  )
  .refine(
    (data) => {
      if (!data.newPassword) return true
      return data.newPassword.length >= 8
    },
    { message: 'Minimum 8 characters', path: ['newPassword'] },
  )
  .refine(
    (data) => {
      if (!data.newPassword && !data.confirmPassword) return true
      return data.newPassword === data.confirmPassword
    },
    { message: 'Passwords do not match', path: ['confirmPassword'] },
  )

export type TProfileUpdate = z.infer<typeof ProfileSchema>
