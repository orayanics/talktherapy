import { Outlet, createFileRoute } from '@tanstack/react-router'
import { sessionQueryOptions } from '~/api/auth'
import { requireRole } from '~/utils/auth-guard'

export const Route = createFileRoute('/_private/(sudo)')({
  ssr: false,
  loader: async ({ context: { queryClient } }) => {
    const session = await queryClient.ensureQueryData(sessionQueryOptions)
    return requireRole(session, 'sudo')
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
