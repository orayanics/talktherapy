import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuthGuard } from '#/modules/auth/hooks/useAuth'
import SlpExerciseCatalog from '#/modules/slp/components/SlpExerciseCatalog'

export const Route = createFileRoute('/_private/(shared)/slp/exercises')({ component: RouteComponent })

function RouteComponent() {
  const { is } = useAuthGuard()
  if (!(is('clinician') || is('admin') || is('superadmin'))) return <Navigate to="/unauthorized" />
  return <SlpExerciseCatalog />
}
