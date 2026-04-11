import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'

import ContentList from '@/modules/content/ContentList'
import { toArray } from '@/utils/query'

const searchSchema = z
  .object({
    page: z.preprocess((v) => Number(v ?? 1), z.number().positive()).default(1),

    search: z
      .string()
      .optional()
      .transform((v) => (v ? v.trim() : ''))
      .refine((v) => v === '' || v.length > 0),

    diagnosis: z
      .any()
      .optional()
      .transform((v) =>
        toArray(v)
          .map((val) => String(val).toLowerCase())
          .filter((val) => val.length > 0),
      ),

    sort: z
      .string()
      .optional()
      .transform((v) => v?.toLowerCase())
      .refine((v) => !v || v === 'asc' || v === 'desc')
      .transform((v) => (v === 'asc' || v === 'desc' ? v : undefined)),

    is_bookmarked: z.boolean().optional().default(false),
  })
  .transform((data) => ({
    ...(data.page !== 1 ? { page: data.page } : {}),
    ...(data.search ? { search: data.search } : {}),
    ...(data.diagnosis.length ? { diagnosis: data.diagnosis } : {}),
    ...(data.sort ? { sort: data.sort } : {}),
    ...(data.is_bookmarked ? { is_bookmarked: data.is_bookmarked } : {}),
  }))

export const Route = createFileRoute('/_private/(shared)/content/')({
  validateSearch: (search) => searchSchema.parse(search),
  component: () => <ContentList />,
})
