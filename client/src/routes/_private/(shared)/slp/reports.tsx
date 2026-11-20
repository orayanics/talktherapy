import { createFileRoute } from '@tanstack/react-router'
import { requireRole } from '#/modules/auth/lib/auth-guard'
import PageLayout from '#/components/Page/PageLayout'
import { PAGE_META } from '#/constants/pageMeta'
import SlpReports from '#/modules/slp/components/SlpReports'

export const Route = createFileRoute('/_private/(shared)/slp/reports')({
  staticData: { page: PAGE_META.slp.children.reports, bcLink: '.' },
  beforeLoad: ({ context }) => {
    requireRole(context.user, 'patient', 'clinician')
  },
  component: () => (
    <PageLayout
      title={PAGE_META.slp.children.reports.title}
      description={PAGE_META.slp.children.reports.description}
      paddedCh
    >
      <SlpReports />
    </PageLayout>
  ),
})
