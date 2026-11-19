import { createFileRoute } from '@tanstack/react-router'
import { requireRole } from '#/modules/auth/lib/auth-guard'
import SlpExerciseCatalog from '#/modules/slp/components/SlpExerciseCatalog'
import { PAGE_META } from '#/constants/pageMeta'

export const Route = createFileRoute('/_private/(shared)/slp/exercises/')({
  staticData: { page: PAGE_META.slp.children.exercises, bcLink: '.' },
  beforeLoad: ({ context }) => {
    requireRole(context.user, 'clinician', 'admin')
  },
  component: SlpExerciseCatalog,
})
