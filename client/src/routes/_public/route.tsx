import { createFileRoute, Outlet, Navigate } from '@tanstack/react-router'

import { authClient } from '@/utils/auth-client'
import StateLoading from '@/components/State/StateLoading'

export const Route = createFileRoute('/_public')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isPending } = authClient.useSession()
  if (isPending) return <StateLoading />
  if (data) {
    return <Navigate to="/dashboard" />
  }

  return <Outlet />
}
