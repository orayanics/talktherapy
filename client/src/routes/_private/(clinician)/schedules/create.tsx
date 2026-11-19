import { createFileRoute } from '@tanstack/react-router'
import ScheduleForm from '#/modules/schedules/components/ScheduleForm'
import { PAGE_META } from '#/constants/pageMeta'

export const Route = createFileRoute('/_private/(clinician)/schedules/create')({
  staticData: { page: PAGE_META.schedules.children.create, bcLink: '.' },
  component: () => <ScheduleForm />,
})
