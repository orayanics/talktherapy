import { createFileRoute } from '@tanstack/react-router'

import AdminContentView from '~/views/content/admin/ContentView'
import SharedContentView from '~/views/content/shared/ContentView'

import { useAuthGuard } from '~/hooks/useAuthGuard'

export const Route = createFileRoute('/_private/(shared)/content/$contentId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { is } = useAuthGuard()
  const isAdmin = is('admin')

  return isAdmin ? <AdminContentView /> : <SharedContentView />
}
