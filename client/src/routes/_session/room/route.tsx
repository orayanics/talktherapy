import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SessionProvider } from '#/modules/auth/context/SessionContext'
import { requireSession } from '#/modules/auth/lib/session-guard'
import SessionError from '#/modules/auth/components/SessionError'
import StateLoading from '#/components/State/StateLoading'
import { useSessionRevalidation } from '#/modules/auth/hooks/useSessionRevalidation'

export const Route = createFileRoute('/_session/room')({
  ssr: false,
  beforeLoad: requireSession,
  pendingComponent: StateLoading,
  errorComponent: SessionError,
  component: RoomLayout,
})

function RoomLayout() {
  const { user } = Route.useRouteContext()
  useSessionRevalidation(user)
  return (
    <SessionProvider value={user}>
      <Outlet />
    </SessionProvider>
  )
}
