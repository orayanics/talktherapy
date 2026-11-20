import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import PatientsPage from '#/modules/patients/components/PatientsPage'
import { fetchClinicianPatients } from '#/modules/patients/api/patients'
import StateLoading from '#/components/State/StateLoading'
import { PAGE_META } from '#/constants/pageMeta'
import PageLayout from '#/components/Page/PageLayout'

const searchSchema = z
  .object({
    page: z.preprocess((v) => Number(v ?? 1), z.number().positive()).default(1),

    search: z
      .string()
      .optional()
      .transform((v) => (v ? v.trim() : '')),

    sort: z
      .string()
      .optional()
      .transform((v) => v?.toLowerCase())
      .refine((v) => !v || v === 'asc' || v === 'desc')
      .transform((v) => (v === 'asc' || v === 'desc' ? v : undefined)),
  })
  .transform((data) => ({
    ...(data.page !== 1 ? { page: data.page } : {}),
    ...(data.search ? { search: data.search } : {}),
    ...(data.sort ? { sort: data.sort } : {}),
  }))

export const Route = createFileRoute('/_private/(clinician)/patients/')({
  staticData: { page: PAGE_META.patients, bcLink: '.' },
  validateSearch: (search) => searchSchema.parse(search),
  loaderDeps: ({ search }) => ({
    page: search.page,
    search: search.search,
    sort: search.sort,
  }),
  loader: ({ context, deps }) =>
    context.queryClient.query(
      fetchClinicianPatients(
        { page: deps.page },
        { search: deps.search || undefined, sort: deps.sort ?? 'desc' },
      ),
    ),
  pendingComponent: StateLoading,
  component: () => (
    <PageLayout
      title={PAGE_META.patients.title}
      description={PAGE_META.patients.description}
      paddedCh
    >
      <PatientsPage />
    </PageLayout>
  ),
})
