import { Outlet, createFileRoute } from '@tanstack/react-router'
import { sessionQueryOptions } from '~/api/auth'
import { requireRole } from '~/utils/auth-guard'

export const Route = createFileRoute('/_private/(shared)/slots')({
  loader: async ({ context: { queryClient } }) => {
    const session = await queryClient.ensureQueryData(sessionQueryOptions)
    return requireRole(session, 'admin', 'clinician')
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
