import { createFileRoute, Outlet } from '@tanstack/react-router'
import SessionBoundary from '#/modules/auth/components/SessionBoundary'

export const Route = createFileRoute('/_session/room')({
  ssr: false,
  component: () => (
    <SessionBoundary>
      <Outlet />
    </SessionBoundary>
  ),
})
