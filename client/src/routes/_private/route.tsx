import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { Bell } from 'lucide-react'

import Sidebar from '@/components/Page/Sidebar'
import { authClient } from '@/utils/auth-client'

import { SessionProvider } from '@/context/SessionContext'
import type { SessionContextValue } from '@/context/SessionContext'

import StateLoading from '@/components/State/StateLoading'
import type { USER_ROLE } from '@/types/account'

export const Route = createFileRoute('/_private')({
  ssr: false,
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isPending } = authClient.useSession()

  if (isPending) return <StateLoading />
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
  const role = data.user.role as USER_ROLE

  return (
    <SessionProvider value={session}>
      <div className="bg-white flex w-screen h-screen font-sans antialiased">
        <Sidebar role={role}>
          <div className="min-h-screen w-full flex-1 overflow-auto relative">
            <header
              className="hidden lg:flex h-18 items-center justify-end
            border-b border-slate-300
            bg-white"
            >
              <div className="items-center justify-end px-4">
                <button className="btn btn-square border border-slate-300">
                  <Bell size={19} strokeWidth={2.2} />
                </button>
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
