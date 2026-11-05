import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { toArray } from '#/utils/query'
import AppointmentsPage from '#/modules/appointments/components/AppointmentsPage'

const searchSchema = z
  .object({
    page: z.preprocess((v) => Number(v ?? 1), z.number().positive()).default(1),

    from: z
      .string()
      .optional()
      .transform((v) => (v && v.trim() !== '' ? v.trim() : undefined)),

    sort: z
      .string()
      .optional()
      .transform((v) => v?.toLowerCase())
      .refine((v) => !v || v === 'asc' || v === 'desc')
      .transform((v) => (v === 'asc' || v === 'desc' ? v : undefined)),
    status: z
      .unknown()
      .optional()
      .transform((v) =>
        toArray(v).filter((value): value is string =>
          ['PENDING', 'ACCEPTED', 'REJECT', 'CANCELLED', 'COMPLETED'].includes(
            String(value).toUpperCase(),
          ),
        ),
      ),
  })
  .transform((data) => ({
    ...(data.page !== 1 ? { page: data.page } : {}),
    ...(data.from ? { from: data.from } : {}),
    ...(data.sort ? { sort: data.sort } : {}),
    ...(data.status.length
      ? { status: data.status.map((value) => value.toUpperCase()) }
      : {}),
  }))

export const Route = createFileRoute('/_private/(shared)/appointments/')({
  validateSearch: (search) => searchSchema.parse(search),
  component: AppointmentsPage,
})
