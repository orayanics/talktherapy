import { createFileRoute } from '@tanstack/react-router'
import ScheduleCreate from '~/modules/schedule/create/ScheduleCreate'

export const Route = createFileRoute('/_private/(shared)/schedules/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ScheduleCreate />
}
