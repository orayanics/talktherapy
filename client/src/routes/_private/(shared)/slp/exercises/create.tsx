import { createFileRoute } from '@tanstack/react-router'
import { requireRole } from '#/modules/auth/lib/auth-guard'
import CreateSlpExercisePage from '#/modules/slp/components/CreateSlpExercisePage'
import { PAGE_META } from '#/constants/pageMeta'
import PageLayout from '#/components/Page/PageLayout'

export const Route = createFileRoute('/_private/(shared)/slp/exercises/create')(
  {
    staticData: {
      page: PAGE_META.slp.children.exercises.children.create,
      bcLink: '.',
    },
    beforeLoad: ({ context }) => {
      requireRole(context.user, 'clinician', 'admin')
    },
    component: () => (
      <PageLayout
        title={PAGE_META.slp.children.exercises.children.create.title}
        description={
          PAGE_META.slp.children.exercises.children.create.description
        }
        paddedCh
      >
        <CreateSlpExercisePage />
      </PageLayout>
    ),
  },
)
