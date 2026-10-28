import { createFileRoute, Outlet, Navigate } from '@tanstack/react-router'

import { authClient } from '#/modules/auth/api/auth-client'
import StateLoading from '#/components/State/StateLoading'

export const Route = createFileRoute('/_public')({
  ssr: false,
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isPending } = authClient.useSession()
  if (isPending) return <StateLoading fullpage />
  if (data) {
    return <Navigate to="/dashboard" />
  }

  return <Outlet />
}
