import { z } from "zod";
import { normalizeKeys, toStringArray } from "@/lib/params";

export const UsersListSchema = z.preprocess(
  normalizeKeys,
  z.object({
    page: z.coerce.number().min(1).default(1),
    per_page: z.coerce.number().min(1).max(100).default(20),

    search: z.string().optional(),

    sort_by: z.string().default("createdAt"),
    sort: z.enum(["asc", "desc"]).default("desc"),

    role: z.preprocess(toStringArray, z.array(z.string()).optional()),
    account_status: z.preprocess(toStringArray, z.array(z.string()).optional()),
  }),
);

export type TUsersListSchema = z.infer<typeof UsersListSchema>;
