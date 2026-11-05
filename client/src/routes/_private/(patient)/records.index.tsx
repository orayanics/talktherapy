import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import PatientRecordsPage from '#/modules/soaps/components/PatientRecordsPage'

const searchSchema = z
  .object({
    page: z.preprocess((v) => Number(v ?? 1), z.number().positive()).default(1),
    sort: z
      .string()
      .optional()
      .transform((v) => v?.toLowerCase())
      .refine((v) => !v || v === 'asc' || v === 'desc')
      .transform((v) => (v === 'asc' || v === 'desc' ? v : undefined)),
  })
  .transform((data) => ({
    ...(data.page !== 1 ? { page: data.page } : {}),
    ...(data.sort ? { sort: data.sort } : {}),
  }))

export const Route = createFileRoute('/_private/(patient)/records/')({
  validateSearch: (search) => searchSchema.parse(search),
  component: PatientRecordsPage,
})
