import { createFileRoute } from '@tanstack/react-router'

import AdminOverview from '~/views/schedules/admin/ScheduleOverview'
import ClinicianOverview from '~/views/schedules/clinician/ScheduleOverview'

import { useAuthGuard } from '~/hooks/useAuthGuard'

export const Route = createFileRoute('/_private/(shared)/schedules/')({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => {
    const date =
      typeof search.date === 'string' ? new Date(search.date) : undefined
    const page = Number(search.page ?? 1)
    const perPage = Number(search.perPage ?? 10)

    return {
      ...(date ? { date } : {}),
      ...(page !== 1 ? { page } : {}),
      ...(perPage !== 10 ? { perPage } : {}),
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { is } = useAuthGuard()
  const isAdmin = is('admin')
  const isClinician = is('clinician')
  const isAllowed = isAdmin || isClinician

  if (!isAllowed) {
    throw new Error('Unauthorized')
  }

  const searchProps = Route.useSearch()

  return isAdmin ? (
    <AdminOverview />
  ) : (
    <ClinicianOverview search={searchProps} />
  )
}
