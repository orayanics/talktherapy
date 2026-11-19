import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'

import ContentList from '#/modules/content/components/ContentList'
import { toArray } from '#/utils/query'
import { fetchContentList } from '#/modules/content/api/content'
import StateLoading from '#/components/State/StateLoading'
import { PAGE_META } from '#/constants/pageMeta'
import PageLayout from '#/components/Page/PageLayout'

const searchSchema = z
  .object({
    page: z.preprocess((v) => Number(v ?? 1), z.number().positive()).default(1),

    search: z
      .string()
      .optional()
      .transform((v) => (v ? v.trim() : ''))
      .refine((v) => v === '' || v.length > 0),

    diagnosis: z
      .unknown()
      .optional()
      .transform((v) =>
        toArray(v)
          .map((val) => String(val))
          .filter((val) => val.length > 0),
      ),

    sort: z
      .string()
      .optional()
      .transform((v) => v?.toLowerCase())
      .refine((v) => !v || v === 'asc' || v === 'desc')
      .transform((v) => (v === 'asc' || v === 'desc' ? v : undefined)),

    is_bookmarked: z.boolean().optional(),
  })
  .transform((data) => ({
    ...(data.page !== 1 ? { page: data.page } : {}),
    ...(data.search ? { search: data.search } : {}),
    ...(data.diagnosis.length ? { diagnosis: data.diagnosis } : {}),
    ...(data.sort ? { sort: data.sort } : {}),
    ...(data.is_bookmarked ? { is_bookmarked: data.is_bookmarked } : {}),
  }))

export const Route = createFileRoute('/_private/(shared)/content/')({
  staticData: { page: PAGE_META.content, bcLink: '.' },
  validateSearch: (search) => searchSchema.parse(search),
  loaderDeps: ({ search }) => ({
    page: search.page,
    search: search.search,
    diagnosis: search.diagnosis,
    sort: search.sort,
    is_bookmarked: search.is_bookmarked,
  }),
  loader: ({ context, deps }) =>
    context.queryClient.query(
      fetchContentList(
        { page: deps.page },
        {
          search: deps.search || undefined,
          diagnosis: deps.diagnosis,
          sort: deps.sort ?? 'desc',
          is_bookmarked: deps.is_bookmarked,
        },
      ),
    ),
  pendingComponent: StateLoading,
  component: () => (
    <PageLayout
      title={PAGE_META.content.title}
      description={PAGE_META.content.description}
      paddedCh
    >
      <ContentList />
    </PageLayout>
  ),
})
