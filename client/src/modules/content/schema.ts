import { z } from 'zod'

const tagArraySchema = z
  .array(z.string())
  .max(3, 'Up to 3 tags are allowed')
  .optional()

export const ContentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  body: z
    .string()
    .min(1, 'Body must not be empty')
    .max(20000, 'Body must be less than 20000 characters'),
  diagnosis_id: z.string().nonempty('Diagnosis is required').min(1),
  tag_names: tagArraySchema,
})

export const UpdateContentSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  body: z
    .string()
    .min(1, 'Body must not be empty')
    .max(20000, 'Body must be less than 20000 characters')
    .optional(),
  diagnosis_id: z.string().min(1, 'Diagnosis is required').optional(),
  tag_names: tagArraySchema,
})

export type TContentSchema = z.infer<typeof ContentSchema>
export type TUpdateContentSchema = z.infer<typeof UpdateContentSchema>
