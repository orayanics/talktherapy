import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import ScheduleList from '@/modules/schedules/list/ScheduleList'

const searchSchema = z
  .object({
    page: z.preprocess((v) => Number(v ?? 1), z.number().positive()).default(1),

    date_from: z
      .string()
      .optional()
      .transform((v) => (v && v.trim() !== '' ? v.trim() : undefined)),

    sort: z
      .string()
      .optional()
      .transform((v) => v?.toLowerCase())
      .refine((v) => !v || v === 'asc' || v === 'desc')
      .transform((v) => (v === 'asc' || v === 'desc' ? v : undefined)),
  })
  .transform((data) => ({
    ...(data.page !== 1 ? { page: data.page } : {}),
    ...(data.date_from ? { from: data.date_from } : {}),
    ...(data.sort ? { sort: data.sort } : {}),
  }))

export const Route = createFileRoute('/_private/(clinician)/schedules/')({
  validateSearch: (search) => searchSchema.parse(search),
  component: () => <ScheduleList />,
})
