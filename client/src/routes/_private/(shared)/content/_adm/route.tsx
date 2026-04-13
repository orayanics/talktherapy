import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { useAuthGuard } from '@/hooks/useAuth'

export const Route = createFileRoute('/_private/(shared)/content/_adm')({
  component: () => {
    const { is } = useAuthGuard()
    const isAllowed = is('admin')
    if (!isAllowed) return <Navigate to="/unauthorized" />
    return <Outlet />
  },
})
