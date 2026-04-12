import { z } from "zod";

export const StoreSlotBookingSchema = z.object({
  patient_id: z.string().uuid().optional(),
  encounter: z.object({
    diagnosis: z.string(),
    chief_complaint: z.string(),
    referral_source: z.string(),
    referral_url: z.string(),
  }),
});

export type TStoreSlotBooking = z.infer<typeof StoreSlotBookingSchema>;
