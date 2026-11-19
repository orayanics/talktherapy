import { createFileRoute } from '@tanstack/react-router'
import ScheduleForm from '#/modules/schedules/components/ScheduleForm'
import { PAGE_META } from '#/constants/pageMeta'
import PageLayout from '#/components/Page/PageLayout'

export const Route = createFileRoute('/_private/(clinician)/schedules/create')({
  staticData: { page: PAGE_META.schedules.children.create, bcLink: '.' },
  component: () => (
    <PageLayout
      title={PAGE_META.schedules.children.create.title}
      description={PAGE_META.schedules.children.create.description}
      paddedCh
    >
      <ScheduleForm />
    </PageLayout>
  ),
})
