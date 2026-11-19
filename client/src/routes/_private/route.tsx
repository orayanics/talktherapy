import { createFileRoute, Outlet, useMatches } from '@tanstack/react-router'
import NotificationRealtime from '#/modules/notifications/components/NotificationRealtime'
import Sidebar from '#/components/Page/Sidebar'
import { SessionProvider } from '#/modules/auth/context/SessionContext'
import { requireSession } from '#/modules/auth/lib/session-guard'
import SessionError from '#/modules/auth/components/SessionError'
import StateLoading from '#/components/State/StateLoading'
import { useSessionRevalidation } from '#/modules/auth/hooks/useSessionRevalidation'
import PageLayout from '#/components/Page/PageLayout'
import { PAGE_META } from '#/constants/pageMeta'
import type { PageMeta } from '#/constants/pageMeta'

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
  const page = useMatches({
    select: (matches) =>
      matches.reduce<PageMeta>(
        (current, match) => match.staticData.page ?? current,
        PAGE_META.dashboard,
      ),
  })
  useSessionRevalidation(user)
  return (
    <SessionProvider value={user}>
      <NotificationRealtime key={user.id} />
      <div className="flex w-screen h-screen">
        <Sidebar role={user.role}>
          <main className="flex-1 min-h-full w-full overflow-auto">
            <PageLayout title={page.title} description={page.description}>
              <Outlet />
            </PageLayout>
          </main>
        </Sidebar>
      </div>
    </SessionProvider>
  )
}
