import { createFileRoute } from '@tanstack/react-router'
import { requireRole } from '#/modules/auth/lib/auth-guard'
import CreateSlpExercisePage from '#/modules/slp/components/CreateSlpExercisePage'

export const Route = createFileRoute('/_private/(shared)/slp/exercises/create')(
  {
    staticData: { crumb: 'Create SLP exercise', bcLink: '.' },
    beforeLoad: ({ context }) => {
      requireRole(context.user, 'clinician', 'admin')
    },
    component: CreateSlpExercisePage,
  },
)
