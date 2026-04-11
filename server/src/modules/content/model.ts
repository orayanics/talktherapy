import { z } from "zod";
import { normalizeKeys, toStringArray } from "@/lib/params";

export const ListContentSchema = z.preprocess(
  normalizeKeys,
  z.object({
    page: z
      .preprocess(
        (v) => (v === undefined ? 1 : Number(v)),
        z.number().int().min(1),
      )
      .optional(),
    search: z.string().nullable().optional(),
    diagnosis_id: z
      .preprocess((v) => toStringArray(v) ?? v, z.array(z.string()))
      .optional(),
    sort: z.enum(["asc", "desc"]).optional(),
    is_bookmarked: z
      .preprocess((v) => (v === undefined ? null : v), z.boolean().nullable())
      .optional(),
  }),
);

export const ListBookmarksSchema = z.object({
  page: z
    .preprocess(
      (v) => (v === undefined ? 1 : Number(v)),
      z.number().int().min(1),
    )
    .optional(),
  per_page: z
    .preprocess(
      (v) => (v === undefined ? 10 : Number(v)),
      z.number().int().min(1),
    )
    .optional(),
  search: z.string().nullable().optional(),
  diagnosis_id: z
    .preprocess((v) => toStringArray(v) ?? v, z.array(z.string()))
    .optional(),
});

export const StoreContentSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  body: z.string().min(1),
  diagnosis_id: z.string().min(1),
  tag_names: z.array(z.string()).optional(),
});

export const UpdateContentSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  diagnosis_id: z.string().optional(),
  tag_names: z.array(z.string()).max(3).optional(),
});

export type TListContent = z.infer<typeof ListContentSchema>;
export type TStoreContent = z.infer<typeof StoreContentSchema>;
export type TUpdateContent = z.infer<typeof UpdateContentSchema>;
export type TListBookmarks = z.infer<typeof ListBookmarksSchema>;
