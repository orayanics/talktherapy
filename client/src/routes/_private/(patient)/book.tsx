import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { toArray } from '#/utils/query'
import BookingPage from '#/modules/book/components/BookingPage'

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
    diagnosis: z
      .unknown()
      .optional()
      .transform((v) =>
        toArray(v)
          .map((val) => String(val))
          .filter((val) => val.length > 0),
      ),
  })
  .transform((data) => ({
    ...(data.page !== 1 ? { page: data.page } : {}),
    ...(data.from ? { from: data.from } : {}),
    ...(data.sort ? { sort: data.sort } : {}),
    ...(data.diagnosis.length ? { diagnosis: data.diagnosis } : {}),
  }))

export const Route = createFileRoute('/_private/(patient)/book')({
  validateSearch: (search) => searchSchema.parse(search),
  component: BookingPage,
})
