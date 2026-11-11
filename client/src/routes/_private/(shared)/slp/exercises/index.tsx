import { createFileRoute } from '@tanstack/react-router'
import { requireRole } from '#/modules/auth/lib/auth-guard'
import SlpExerciseCatalog from '#/modules/slp/components/SlpExerciseCatalog'

export const Route = createFileRoute('/_private/(shared)/slp/exercises/')({
  beforeLoad: ({ context }) => {
    requireRole(context.user, 'clinician', 'admin')
  },
  component: SlpExerciseCatalog,
})
