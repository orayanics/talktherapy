import { z } from 'zod'

const utcDateTimeLocal = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  .refine((value) => !Number.isNaN(Date.parse(`${value}:00Z`)), {
    message: 'Enter a valid UTC date and time',
  })

export const ScheduleSchema = z
  .object({
    start_at: utcDateTimeLocal,
    end_at: utcDateTimeLocal,
    recurrence_rule: z.string().nullable().optional(),
  })
  .refine(
    (schedule) =>
      Date.parse(`${schedule.end_at}:00Z`) >
      Date.parse(`${schedule.start_at}:00Z`),
    {
      message: 'End time must be after start time',
      path: ['end_at'],
    },
  )

export type TSchedule = z.infer<typeof ScheduleSchema>

export interface CreateSchedulePayload {
  start_at: string
  end_at: string
  recurrence_rule: string | null | undefined
  timezone: 'UTC'
}

export const Frequency = z.enum(['none', 'daily', 'weekly', 'monthly'])
export type TFrequency = z.infer<typeof Frequency>

export const DayCode = z.enum(['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'])
export type TDayCode = z.infer<typeof DayCode>
