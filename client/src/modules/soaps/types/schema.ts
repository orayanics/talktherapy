import { z } from 'zod'

export const CreateSoapSchema = z.object({
  activity_plan: z.string().min(1, 'Activity plan is required'),
  session_type: z.string().max(100).nullable().optional(),
  subjective_notes: z.string().max(20000).nullable().optional(),
  objective_notes: z.string().max(20000).nullable().optional(),
  assessment: z.string().max(20000).nullable().optional(),
  recommendation: z.string().max(20000).nullable().optional(),
  comments: z.string().max(20000).nullable().optional(),
})

export const UpdateSoapSchema = CreateSoapSchema.partial()

export type TCreateSoapSchema = z.infer<typeof CreateSoapSchema>
export type TUpdateSoapSchema = z.infer<typeof UpdateSoapSchema>
