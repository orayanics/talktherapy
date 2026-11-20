import { createFileRoute } from '@tanstack/react-router'
import { requireRole } from '#/modules/auth/lib/auth-guard'
import ExerciseCollections from '#/modules/slp/components/ExerciseCollections'
import { PAGE_META } from '#/constants/pageMeta'
import PageLayout from '#/components/Page/PageLayout'

export const Route = createFileRoute('/_private/(shared)/slp/exercises/')({
  staticData: { page: PAGE_META.slp.children.exercises, bcLink: '.' },
  beforeLoad: ({ context }) => {
    requireRole(context.user, 'clinician', 'admin')
  },
  component: () => (
    <PageLayout
      title={PAGE_META.slp.children.exercises.title}
      description={PAGE_META.slp.children.exercises.description}
      paddedCh
    >
      <ExerciseCollections />
    </PageLayout>
  ),
})
