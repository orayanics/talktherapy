import {
  Outlet,
  createFileRoute,
  isRedirect,
  redirect,
} from '@tanstack/react-router'
import type { UserType } from '~/models/user/user'
import { sessionQueryOptions } from '~/api/auth'

import { SessionProvider } from '~/context/SessionContext'
import Sidebar from '~/components/Sidebar/Sidebar'

export const Route = createFileRoute('/_private')({
  ssr: false,
  beforeLoad: () => {
    if (!localStorage.getItem('talktherapy_session')) {
      throw redirect({ to: '/login' })
    }
  },
  loader: async ({ context: { queryClient } }) => {
    try {
      const session = await queryClient.ensureQueryData(sessionQueryOptions)

      if (!session || session.account_status !== 'active') {
        queryClient.clear()
        localStorage.removeItem('talktherapy_session')
        throw redirect({ to: '/login' })
      }

      return session
    } catch (error: unknown) {
      if (isRedirect(error)) throw error

      queryClient.clear()
      localStorage.removeItem('talktherapy_session')
      throw redirect({ to: '/login' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const session = Route.useLoaderData()
  const { account_role } = session

  return (
    <SessionProvider value={session}>
      <div className="flex bg-white">
        <Sidebar role={account_role as UserType}>
          <div className="w-full flex-1 overflow-auto min-h-screen p-4">
            <Outlet />
          </div>
        </Sidebar>
      </div>
    </SessionProvider>
  )
}
