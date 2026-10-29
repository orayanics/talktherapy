import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { authClient } from '#/modules/auth/api/auth-client'

import { SessionProvider } from '#/modules/auth/context/SessionContext'
import type { SessionContextValue } from '#/modules/auth/context/SessionContext'

import StateLoading from '#/components/State/StateLoading'

export const Route = createFileRoute('/_session/room')({
  ssr: false,
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isPending } = authClient.useSession()

  if (isPending) return <StateLoading fullpage />
  if (!data) {
    return <Navigate to="/login" />
  }

  const user = data.user
  const session: SessionContextValue = {
    ...user,
    image: user.image ?? null,
    role: user.role,
    banned: user.banned ?? false,
    banExpires: user.banExpires ?? null,
    banReason: user.banReason ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }

  return (
    <SessionProvider value={session}>
      <Outlet />
    </SessionProvider>
  )
}
