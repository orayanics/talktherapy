import { createFileRoute } from '@tanstack/react-router'

import DashboardView from '@/modules/dashboard/DashboardView'

export const Route = createFileRoute('/_private/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <DashboardView />
}
