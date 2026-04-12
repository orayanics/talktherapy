import { z } from "zod";

export const ClinicianDecisionSchema = z.object({
  reason: z.string(),
  is_hidden: z.boolean().optional(),
});

export const AppointmentQuerySchema = z.preprocess(
  (v) => v,
  z.object({
    per_page: z
      .preprocess(
        (v) => (v === undefined ? 15 : Number(v)),
        z.number().int().min(1),
      )
      .optional(),
    date_from: z.string().optional(),
    date_to: z.string().optional(),
    sort: z.enum(["asc", "desc"]).optional(),
    diagnosis: z.any().optional(),
  }),
);

export type TAppointmentQuery = z.infer<typeof AppointmentQuerySchema>;
