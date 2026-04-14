import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { authClient } from '@/utils/auth-client'

import { SessionProvider } from '@/context/SessionContext'
import type { SessionContextValue } from '@/context/SessionContext'

import StateLoading from '@/components/State/StateLoading'
import type { USER_ROLE } from '@/types/account'

export const Route = createFileRoute('/_session/room')({
  ssr: false,
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isPending } = authClient.useSession()

  if (isPending) return <StateLoading fullpage />
  if (!data) {
    authClient.signOut()
    return <Navigate to="/login" />
  }

  const user = data.user
  const session: SessionContextValue = {
    ...user,
    image: user.image ?? null,
    role: user.role as USER_ROLE,
    banned: user.banned ?? false,
    banExpires: user.banExpires ?? null,
    banReason: user.banReason ?? null,
    createdAt:
      user.createdAt instanceof Date
        ? user.createdAt.toISOString()
        : user.createdAt,
    updatedAt:
      user.updatedAt instanceof Date
        ? user.updatedAt.toISOString()
        : user.updatedAt,
  }

  return (
    <SessionProvider value={session}>
      <Outlet />
    </SessionProvider>
  )
}
