import { z } from "zod";
import { normalizeKeys } from "@/lib/params";

const LogsListBaseSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  per_page: z.coerce.number().min(1).max(100).default(20),

  search: z.string().optional(),

  date_from: z.string().optional(),
  date_to: z.string().optional(),

  sort_by: z.string().default("createdAt"),
  sort: z.enum(["asc", "desc"]).default("desc"),
});

export const LogsListSchema = z.preprocess(normalizeKeys, LogsListBaseSchema);

export type TLogsListSchema = z.infer<typeof LogsListSchema>;

export const LogsExportSchema = z.preprocess(
  normalizeKeys,
  LogsListBaseSchema.extend({
    format: z.enum(["csv", "jsonl"]).default("csv"),
    batch_size: z.coerce.number().min(1).default(1000),
  }),
);

export type TLogsExportSchema = z.infer<typeof LogsExportSchema>;
