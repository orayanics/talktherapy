import { z } from 'zod'

export const AppointmentActionSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
  is_hidden: z.boolean().optional(),
})

export type TAppointmentAction = z.infer<typeof AppointmentActionSchema>
