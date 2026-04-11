import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requireRole } from '@/utils/auth-guard'

export const Route = createFileRoute('/_private/(shared)/content/_adm')({
  loader: ({ context }) => {
    requireRole(context.session, 'ADMIN')
  },
  component: () => <Outlet />,
})
