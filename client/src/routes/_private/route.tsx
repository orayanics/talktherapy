import { createFileRoute, Outlet } from '@tanstack/react-router'
import NotificationRealtime from '#/modules/notifications/components/NotificationRealtime'
import Sidebar from '#/components/Page/Sidebar'
import { SessionProvider } from '#/modules/auth/context/SessionContext'
import { requireSession } from '#/modules/auth/lib/session-guard'
import SessionError from '#/modules/auth/components/SessionError'
import StateLoading from '#/components/State/StateLoading'
import { useSessionRevalidation } from '#/modules/auth/hooks/useSessionRevalidation'

export const Route = createFileRoute('/_private')({
  ssr: false,
  beforeLoad: requireSession,
  pendingComponent: StateLoading,
  errorComponent: SessionError,
  component: PrivateLayout,
})

function PrivateLayout() {
  const { user } = Route.useRouteContext()
  useSessionRevalidation(user)
  return (
    <SessionProvider value={user}>
      <NotificationRealtime key={user.id} />
      <div className="flex w-screen h-screen">
        <Sidebar role={user.role}>
          <main className="p-2 flex-1 min-h-full w-full overflow-auto">
            <Outlet />
          </main>
        </Sidebar>
      </div>
    </SessionProvider>
  )
}
