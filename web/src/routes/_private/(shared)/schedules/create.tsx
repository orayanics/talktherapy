import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuthGuard } from '~/hooks/useAuthGuard'
import ScheduleCreate from '~/modules/schedule/create/ScheduleCreate'

export const Route = createFileRoute('/_private/(shared)/schedules/create')({
  component: RouteComponent,
})

function RouteComponent() {
  const { is } = useAuthGuard()
  const isClinician = is('clinician')

  if (!isClinician) {
    const navigate = useNavigate()
    navigate({
      to: '/schedules',
    })
  }
  return <ScheduleCreate />
}
