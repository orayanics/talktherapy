import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import NotificationRealtime from '#/modules/notifications/components/NotificationRealtime'

import Sidebar from '#/components/Page/Sidebar'
import { authClient } from '#/modules/auth/api/auth-client'

import { SessionProvider } from '#/modules/auth/context/SessionContext'
import type { SessionContextValue } from '#/modules/auth/context/SessionContext'

import StateLoading from '#/components/State/StateLoading'

export const Route = createFileRoute('/_private')({
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
  const role = data.user.role

  return (
    <SessionProvider value={session}>
      <NotificationRealtime key={session.id} />
      <div className="bg-white flex w-screen h-screen font-sans antialiased">
        <Sidebar role={role}>
          <div className="min-h-screen w-full flex-1 overflow-auto relative">
            <main className="flex-1 w-full overflow-y-auto p-4">
              <Outlet />
            </main>
          </div>
        </Sidebar>
      </div>
    </SessionProvider>
  )
}
