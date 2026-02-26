import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useAuthGuard } from '~/hooks/useAuthGuard'

export const Route = createFileRoute(
  '/_private/(shared)/content/(admin-content)',
)({
  component: () => {
    const { is } = useAuthGuard()
    const isAdmin = is('admin')

    if (!isAdmin) {
      throw new Error('Unauthorized')
    }
    return <Outlet />
  },
})
