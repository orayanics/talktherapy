import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { toArray } from '#/utils/query'
import AppointmentsPage from '#/modules/appointments/components/AppointmentsPage'
import { PAGE_META } from '#/constants/pageMeta'
import PageLayout from '#/components/Page/PageLayout'

const searchSchema = z
  .object({
    page: z.preprocess((v) => Number(v ?? 1), z.number().positive()).default(1),

    from: z
      .string()
      .optional()
      .transform((v) => (v && v.trim() !== '' ? v.trim() : undefined)),

    to: z
      .string()
      .optional()
      .transform((v) => (v && v.trim() !== '' ? v.trim() : undefined)),

    sort: z
      .string()
      .optional()
      .transform((v) => v?.toLowerCase())
      .refine((v) => !v || v === 'asc' || v === 'desc')
      .transform((v) => (v === 'asc' || v === 'desc' ? v : undefined)),
    appointmentId: z.string().uuid().optional(),
    status: z
      .unknown()
      .optional()
      .transform((v) =>
        toArray(v).filter((value): value is string =>
          ['PENDING', 'ACCEPTED', 'REJECT', 'CANCELLED', 'COMPLETED'].includes(
            String(value).toUpperCase(),
          ),
        ),
      ),
  })
  .transform((data) => ({
    ...(data.page !== 1 ? { page: data.page } : {}),
    ...(data.from ? { from: data.from } : {}),
    ...(data.to ? { to: data.to } : {}),
    ...(data.sort ? { sort: data.sort } : {}),
    ...(data.status.length
      ? { status: data.status.map((value) => value.toUpperCase()) }
      : {}),
    ...(data.appointmentId ? { appointmentId: data.appointmentId } : {}),
  }))

export const Route = createFileRoute('/_private/(shared)/appointments/')({
  staticData: { page: PAGE_META.appointments, bcLink: '.' },
  validateSearch: (search) => searchSchema.parse(search),
  component: () => (
    <PageLayout
      title={PAGE_META.appointments.title}
      description={PAGE_META.appointments.description}
      paddedCh
    >
      <AppointmentsPage />
    </PageLayout>
  ),
})
