import { z } from 'zod'

export const RegisterPatientSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    diagnosis_id: z.string().min(1, 'Diagnosis is required'),
    email: z.email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
    consent: z.boolean().refine((val) => val === true, {
      message: 'You must give consent to register',
    }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
  })

export const RegisterClinicianSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  diagnosis_id: z.string().min(1, 'Diagnosis is required'),
})

export const RegisterAdminSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type TRegisterPatient = z.infer<typeof RegisterPatientSchema>
export type TRegisterClinician = z.infer<typeof RegisterClinicianSchema>
export type TRegisterAdmin = z.infer<typeof RegisterAdminSchema>
