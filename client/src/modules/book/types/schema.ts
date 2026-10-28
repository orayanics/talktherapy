import { z } from 'zod'

export const EncounterSchema = z.object({
  diagnosis: z.string().min(1),
  chief_complaint: z.string().min(1),
  referral_source: z.string().min(1),
  referral_url: z.union([z.literal(''), z.string().url().max(2048)]),
})

export const BookSlotSchema = z.object({
  encounter: EncounterSchema,
})

export type TBookSlot = z.infer<typeof BookSlotSchema>
