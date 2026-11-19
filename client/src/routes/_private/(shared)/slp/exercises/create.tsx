import { createFileRoute } from '@tanstack/react-router'
import { requireRole } from '#/modules/auth/lib/auth-guard'
import CreateSlpExercisePage from '#/modules/slp/components/CreateSlpExercisePage'
import { PAGE_META } from '#/constants/pageMeta'

export const Route = createFileRoute('/_private/(shared)/slp/exercises/create')(
  {
    staticData: {
      page: PAGE_META.slp.children.exercises.children.create,
      bcLink: '.',
    },
    beforeLoad: ({ context }) => {
      requireRole(context.user, 'clinician', 'admin')
    },
    component: CreateSlpExercisePage,
  },
)
