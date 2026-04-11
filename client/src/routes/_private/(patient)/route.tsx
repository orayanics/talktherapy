import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requireRole } from '@/utils/auth-guard'

export const Route = createFileRoute('/_private/(patient)')({
  loader: ({ context }) => {
    requireRole(context.session, 'PATIENT')
  },
  component: () => <Outlet />,
})
