import { createFileRoute, Outlet } from '@tanstack/react-router'
import NotificationRealtime from '#/modules/notifications/components/NotificationRealtime'
import Sidebar from '#/components/Page/Sidebar'
import { SessionProvider } from '#/modules/auth/context/SessionContext'
import { requireSession } from '#/modules/auth/lib/session-guard'
import SessionError from '#/modules/auth/components/SessionError'
import StateLoading from '#/components/State/StateLoading'
import { useSessionRevalidation } from '#/modules/auth/hooks/useSessionRevalidation'
import { PAGE_META } from '#/constants/pageMeta'

export const Route = createFileRoute('/_private')({
  staticData: { page: PAGE_META.dashboard, bcLink: '/dashboard' },
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
      <div
        data-theme="app"
        className="app-shell flex h-dvh w-full overflow-hidden"
      >
        <Sidebar role={user.role}>
          <main
            id="app-main"
            tabIndex={-1}
            className="min-h-full min-w-0 w-full"
          >
            <Outlet />
          </main>
        </Sidebar>
      </div>
    </SessionProvider>
  )
}
