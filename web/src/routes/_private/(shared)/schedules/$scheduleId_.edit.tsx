import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import LoaderTable from '~/components/Loader/LoaderTable'
import SkeletonError from '~/components/Skeleton/SkeletonError'
import SkeletonNull from '~/components/Skeleton/SkeletonNull'

import ScheduleEdit from '~/modules/schedule/edit'
import { availabilityByIdQuery } from '~/api/scheduling'

export const Route = createFileRoute(
  '/_private/(shared)/schedules/$scheduleId_/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { scheduleId } = Route.useParams()
  const { data, isLoading, error } = useQuery(availabilityByIdQuery(scheduleId))

  if (isLoading) return <LoaderTable />
  if (error) return <SkeletonError />
  if (!data.data || data.data.length === 0) return <SkeletonNull />

  return <ScheduleEdit data={data} />
}
