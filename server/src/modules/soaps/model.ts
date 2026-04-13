import { z } from "zod";

export const StoreSoapSchema = z.object({
  activity_plan: z.string(),
  session_type: z.string().nullable().optional(),
  subjective_notes: z.string().nullable().optional(),
  objective_notes: z.string().nullable().optional(),
  assessment: z.string().nullable().optional(),
  recommendation: z.string().nullable().optional(),
  comments: z.string().nullable().optional(),
});

export const UpdateSoapSchema = z.object({
  activity_plan: z.string().nullable().optional(),
  session_type: z.string().nullable().optional(),
  subjective_notes: z.string().nullable().optional(),
  objective_notes: z.string().nullable().optional(),
  assessment: z.string().nullable().optional(),
  recommendation: z.string().nullable().optional(),
  comments: z.string().nullable().optional(),
});

export const SoapQuerySchema = z.object({
  page: z.string().optional(),
  per_page: z.string().optional(),
  sort: z.enum(["asc", "desc"]).optional(),
});

export type StoreSoapInput = z.infer<typeof StoreSoapSchema>;
export type UpdateSoapInput = z.infer<typeof UpdateSoapSchema>;
