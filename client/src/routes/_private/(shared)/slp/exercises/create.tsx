import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuthGuard } from '#/modules/auth/hooks/useAuth'
import CreateSlpExercisePage from '#/modules/slp/components/CreateSlpExercisePage'

export const Route = createFileRoute('/_private/(shared)/slp/exercises/create')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  const { is } = useAuthGuard()
  if (!(is('clinician') || is('admin') || is('superadmin')))
    return <Navigate to="/unauthorized" />
  return <CreateSlpExercisePage />
}
