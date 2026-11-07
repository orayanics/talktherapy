import { createFileRoute, Outlet } from '@tanstack/react-router'
import NotificationRealtime from '#/modules/notifications/components/NotificationRealtime'
import Sidebar from '#/components/Page/Sidebar'
import SessionBoundary from '#/modules/auth/components/SessionBoundary'
import { useSession } from '#/modules/auth/context/SessionContext'

export const Route = createFileRoute('/_private')({
  ssr: false,
  component: () => (
    <SessionBoundary>
      <PrivateLayout />
    </SessionBoundary>
  ),
})

function PrivateLayout() {
  const user = useSession()
  return (
    <>
      <NotificationRealtime key={user.id} />
      <div className="flex w-screen h-screen">
        <Sidebar role={user.role}>
          <main className="p-2 flex-1 min-h-full w-full overflow-auto">
            <Outlet />
          </main>
        </Sidebar>
      </div>
    </>
  )
}
