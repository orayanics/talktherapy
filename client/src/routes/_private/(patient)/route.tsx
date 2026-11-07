import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requireRole } from '#/modules/auth/lib/auth-guard'

export const Route = createFileRoute('/_private/(patient)')({
  beforeLoad: ({ context }) => {
    requireRole(context.user, 'patient')
  },
  component: Outlet,
})
