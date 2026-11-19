import { createFileRoute } from '@tanstack/react-router'
import { requireRole } from '#/modules/auth/lib/auth-guard'
import SlpAssignments from '#/modules/slp/components/SlpAssignments'
import { PAGE_META } from '#/constants/pageMeta'
import PageLayout from '#/components/Page/PageLayout'

export const Route = createFileRoute('/_private/(shared)/slp/assignments')({
  staticData: { page: PAGE_META.slp.children.assignments, bcLink: '.' },
  beforeLoad: ({ context }) => {
    requireRole(context.user, 'patient', 'clinician')
  },
  component: () => (
    <PageLayout
      title={PAGE_META.slp.children.assignments.title}
      description={PAGE_META.slp.children.assignments.description}
      paddedCh
    >
      <SlpAssignments />
    </PageLayout>
  ),
})
