import { requireRole } from '@/utils/auth-guard'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_private/(clinician)')({
  loader: ({ context }) => {
    requireRole(context.session, 'CLINICIAN')
  },
  component: () => <Outlet />,
})
