import { z } from 'zod'

const isoDatetime = z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
  message: 'Must be a valid ISO datetime string',
})

export const ScheduleSchema = z
  .object({
    start_at: isoDatetime,
    end_at: isoDatetime,
    recurrence_rule: z
      .string()
      .regex(/^[A-Z]+=.+(?:;[A-Z]+=.+)*$/)
      .nullable()
      .optional(), // RFC RRULE-like string (basic shape)
  })
  .refine((d) => Date.parse(d.end_at) >= Date.parse(d.start_at), {
    message: 'end_at must be the same or after start_at',
    path: ['end_at'],
  })

export type TSchedule = z.infer<typeof ScheduleSchema>

export const Frequency = z.enum(['none', 'daily', 'weekly', 'monthly'])
export type TFrequency = z.infer<typeof Frequency>

export const DayCode = z.enum(['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'])
export type TDayCode = z.infer<typeof DayCode>
