import { useAuthGuard } from '@/hooks/useAuth'
import { createFileRoute, Outlet, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_private/(clinician)')({
  component: () => {
    const { is } = useAuthGuard()
    const isAllowed = is('clinician')
    if (!isAllowed) return <Navigate to="/unauthorized" />
    return <Outlet />
  },
})
