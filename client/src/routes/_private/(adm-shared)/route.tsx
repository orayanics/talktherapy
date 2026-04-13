import { useAuthGuard } from '@/hooks/useAuth'
import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_private/(adm-shared)')({
  component: () => {
    const { is } = useAuthGuard()
    const isAllowed = is('admin')
    if (!isAllowed) return <Navigate to="/unauthorized" />
    return <Outlet />
  },
})
