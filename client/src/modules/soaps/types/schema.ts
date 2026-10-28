import { z } from 'zod'

export const CreateSoapSchema = z.object({
  activity_plan: z.string().min(1, 'Activity plan is required'),
  session_type: z.string().min(1, 'Session type is required'),
  subjective_notes: z.string().min(1, 'Subjective notes are required'),
  objective_notes: z.string().min(1, 'Objective notes are required'),
  assessment: z.string().min(1, 'Assessment is required'),
  recommendation: z.string().min(1, 'Recommendation is required'),
  comments: z.string().optional(),
})

export const UpdateSoapSchema = CreateSoapSchema.partial()

export type TCreateSoapSchema = z.infer<typeof CreateSoapSchema>
export type TUpdateSoapSchema = z.infer<typeof UpdateSoapSchema>
