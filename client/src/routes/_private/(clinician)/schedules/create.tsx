import { createFileRoute } from '@tanstack/react-router'
import ScheduleForm from '#/modules/schedules/components/ScheduleForm'

export const Route = createFileRoute('/_private/(clinician)/schedules/create')({
  component: () => <ScheduleForm />,
})
