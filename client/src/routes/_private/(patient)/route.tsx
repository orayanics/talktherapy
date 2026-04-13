import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { useAuthGuard } from '@/hooks/useAuth'

export const Route = createFileRoute('/_private/(patient)')({
  component: () => {
    const { is } = useAuthGuard()
    const isAllowed = is('patient')
    if (!isAllowed) return <Navigate to="/unauthorized" />
    return <Outlet />
  },
})
