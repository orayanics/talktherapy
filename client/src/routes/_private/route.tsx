import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { Bell } from 'lucide-react'
import { useState } from 'react'
import NotificationList from '#/modules/notifications/components/NotificationList'
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
  const [show, setShow] = useState(false)

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
            <header
              className="hidden lg:flex h-18 items-center justify-end
            border-b border-slate-300
            bg-white"
            >
              <div className="items-center justify-end px-4 relative">
                <button
                  className="btn btn-square border border-slate-300"
                  onClick={() => setShow((s) => !s)}
                >
                  <Bell size={19} strokeWidth={2.2} />
                </button>
                {show && (
                  <div className="absolute z-20 right-0 mt-2">
                    <NotificationList />
                  </div>
                )}
              </div>
            </header>

            <main className="flex-1 w-full overflow-y-auto p-4">
              <Outlet />
            </main>
          </div>
        </Sidebar>
      </div>
    </SessionProvider>
  )
}
