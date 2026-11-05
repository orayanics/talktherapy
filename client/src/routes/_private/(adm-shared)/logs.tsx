import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import LogsPage from '#/modules/logs/components/LogsPage'

const searchSchema = z
  .object({
    page: z.preprocess((v) => Number(v ?? 1), z.number().positive()).default(1),

    search: z
      .string()
      .optional()
      .transform((v) => (v ? v.trim() : '')),

    date_from: z
      .string()
      .optional()
      .transform((v) => (v && v.trim() !== '' ? v.trim() : undefined)),

    date_to: z
      .string()
      .optional()
      .transform((v) => (v && v.trim() !== '' ? v.trim() : undefined)),

    per_page: z
      .preprocess((v) => Number(v ?? 10), z.number().positive())
      .optional()
      .transform((v) =>
        v && Number.isFinite(v) ? Math.min(200, Math.floor(v)) : undefined,
      ),

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
    ...(data.date_from ? { date_from: data.date_from } : {}),
    ...(data.date_to ? { date_to: data.date_to } : {}),
    ...(data.sort ? { sort: data.sort } : {}),
    ...(data.per_page ? { per_page: data.per_page } : {}),
  }))

export const Route = createFileRoute('/_private/(adm-shared)/logs')({
  validateSearch: (search) => searchSchema.parse(search),
  component: LogsPage,
})
