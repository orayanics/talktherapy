import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import PatientsPage from '#/modules/patients/components/PatientsPage'

const searchSchema = z
  .object({
    page: z.preprocess((v) => Number(v ?? 1), z.number().positive()).default(1),

    search: z
      .string()
      .optional()
      .transform((v) => (v ? v.trim() : '')),

    sort: z
      .string()
      .optional()
      .transform((v) => v?.toLowerCase())
      .refine((v) => !v || v === 'asc' || v === 'desc')
      .transform((v) => (v === 'asc' || v === 'desc' ? v : undefined)),
  })
  .transform((data) => ({
    ...(data.page !== 1 ? { page: data.page } : {}),
    ...(data.search ? { search: data.search } : {}),
    ...(data.sort ? { sort: data.sort } : {}),
  }))

export const Route = createFileRoute('/_private/(clinician)/patients/')({
  validateSearch: (search) => searchSchema.parse(search),
  component: PatientsPage,
})
