import {
  Outlet,
  createFileRoute,
  isRedirect,
  redirect,
} from '@tanstack/react-router'
import { sessionQueryOptions } from '~/api/auth'

export const Route = createFileRoute('/_public')({
  ssr: false,
  loader: async ({ context: { queryClient } }) => {
    if (!localStorage.getItem('talktherapy_session')) return null

    try {
      const session = await queryClient.ensureQueryData(sessionQueryOptions)

      if (session?.account_status === 'active') {
        throw redirect({ to: '/dashboard' })
      }
    } catch (error: unknown) {
      if (isRedirect(error)) throw error
    }

    return null
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
