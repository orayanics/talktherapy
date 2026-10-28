import { z } from 'zod'

const tagArraySchema = z
    .array(z.string().trim().min(1).max(50))
    .max(3, 'Up to 3 tags are allowed')
    .optional()

export const ContentSchema = z.object({
    title: z.string().trim().min(1, 'Title is required').max(255),
    description: z.string().trim().min(1, 'Description is required').max(2000),
    body: z
        .string()
        .min(1, 'Body must not be empty')
        .max(100000, 'Body must be at most 100000 characters'),
    diagnosis_id: z.string().nonempty('Diagnosis is required').min(1),
    tag_names: tagArraySchema,
})

export const UpdateContentSchema = z.object({
    title: z.string().trim().min(1, 'Title is required').max(255).optional(),
    description: z
        .string()
        .trim()
        .min(1, 'Description is required')
        .max(2000)
        .optional(),
    body: z
        .string()
        .min(1, 'Body must not be empty')
        .max(100000, 'Body must be at most 100000 characters')
        .optional(),
    diagnosis_id: z
        .string()
        .optional()
        .transform((value) => (value === '' ? null : value)),
    tag_names: tagArraySchema,
})

export type TContentSchema = z.infer<typeof ContentSchema>
export type TUpdateContentInput = z.input<typeof UpdateContentSchema>
export type TUpdateContentSchema = z.output<typeof UpdateContentSchema>
