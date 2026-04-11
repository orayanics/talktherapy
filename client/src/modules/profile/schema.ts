import { z } from 'zod'

export const ProfileSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
  })
  .required()

export type TProfileUpdate = z.infer<typeof ProfileSchema>
